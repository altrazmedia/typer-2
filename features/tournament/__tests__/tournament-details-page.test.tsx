import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TournamentDetailsPage } from "@/features/tournament/pages/tournament-details-page";
import { getTournamentDetailForUser } from "@/features/tournament/server/get-tournament-detail";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeGame, makeGroup, makeTournament } from "@/test/factories";

vi.mock("@/features/tournament/server/get-tournament-detail", () => ({
  getTournamentDetailForUser: vi.fn(),
}));

vi.mock("@/components/ui/tab-navigation", () => ({
  TabNavigation: ({
    tabs,
    activeTab,
  }: {
    activeTab: string;
    tabs: { label: string; value: string }[];
  }) => (
    <nav data-testid="tab-navigation" data-active-tab={activeTab}>
      {tabs.map((t) => (
        <span key={t.value}>{t.label}</span>
      ))}
    </nav>
  ),
}));

vi.mock("@/features/game/components/upcoming-game-card", () => ({
  UpcomingGameCard: ({ game }: { game: { awayTeam: string; homeTeam: string } }) => (
    <div>
      {game.homeTeam} vs {game.awayTeam}
    </div>
  ),
}));

vi.mock("@/features/game/components/finished-game-card", () => ({
  FinishedGameCard: ({ game }: { game: { awayTeam: string; homeTeam: string } }) => (
    <div>
      {game.homeTeam} vs {game.awayTeam}
    </div>
  ),
}));

vi.mock("@/features/tournament/components/edit-tournament-dialog", () => ({
  EditTournamentDialog: () => null,
}));

vi.mock("@/features/game/components/create-game-dialog", () => ({
  CreateGameDialog: () => null,
}));

describe("TournamentDetailsPage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("redirects to login when the user is not authenticated", async () => {
    const { redirect } = await import("next/navigation");
    mockUnauthed();
    vi.mocked(redirect).mockImplementation(() => {
      throw new Error("redirect");
    });

    await expect(
      TournamentDetailsPage({
        params: Promise.resolve({ id: "t1" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("redirect");

    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("calls notFound when the tournament is missing", async () => {
    const { notFound } = await import("next/navigation");
    mockAuthedUser({ id: "user_1" });
    vi.mocked(getTournamentDetailForUser).mockResolvedValue(null);
    vi.mocked(notFound).mockImplementation(() => {
      throw new Error("notFound");
    });

    await expect(
      TournamentDetailsPage({
        params: Promise.resolve({ id: "missing" }),
        searchParams: Promise.resolve({}),
      }),
    ).rejects.toThrow("notFound");
  });

  it("classifies games by kickoff and shows upcoming on the default tab", async () => {
    mockAuthedUser({ id: "user_1" });
    const group = makeGroup();
    const tournament = makeTournament({ groupId: group.id });
    const pastGame = makeGame({
      awayTeam: "Past Away",
      homeTeam: "Past Home",
      id: "game_past",
      kickoffAt: new Date("2026-06-10T12:00:00.000Z"),
      tournamentId: tournament.id,
    });
    const futureGame = makeGame({
      awayTeam: "Future Away",
      homeTeam: "Future Home",
      id: "game_future",
      kickoffAt: new Date("2026-06-20T12:00:00.000Z"),
      tournamentId: tournament.id,
    });
    vi.mocked(getTournamentDetailForUser).mockResolvedValue({
      isAdmin: false,
      tournament: {
        ...tournament,
        group,
        games: [pastGame, futureGame],
        scoringRule: {
          id: "sr_1",
          tournamentId: tournament.id,
          exactScorePoints: 3,
          correctOutcomePoints: 1,
        },
      },
    } as Awaited<ReturnType<typeof getTournamentDetailForUser>>);

    const element = await TournamentDetailsPage({
      params: Promise.resolve({ id: tournament.id }),
      searchParams: Promise.resolve({}),
    });
    render(element);

    expect(screen.getByText("Future Home vs Future Away")).toBeInTheDocument();
    expect(screen.queryByText("Past Home vs Past Away")).not.toBeInTheDocument();
  });

  it("parses ?tab=finished and shows only finished games", async () => {
    mockAuthedUser({ id: "user_1" });
    const group = makeGroup();
    const tournament = makeTournament({ groupId: group.id });
    const pastGame = makeGame({
      awayTeam: "Past Away",
      homeTeam: "Past Home",
      id: "game_past",
      kickoffAt: new Date("2026-06-10T12:00:00.000Z"),
      tournamentId: tournament.id,
    });
    const futureGame = makeGame({
      awayTeam: "Future Away",
      homeTeam: "Future Home",
      id: "game_future",
      kickoffAt: new Date("2026-06-20T12:00:00.000Z"),
      tournamentId: tournament.id,
    });
    vi.mocked(getTournamentDetailForUser).mockResolvedValue({
      isAdmin: false,
      tournament: {
        ...tournament,
        group,
        games: [pastGame, futureGame],
        scoringRule: {
          id: "sr_1",
          tournamentId: tournament.id,
          exactScorePoints: 3,
          correctOutcomePoints: 1,
        },
      },
    } as Awaited<ReturnType<typeof getTournamentDetailForUser>>);

    const element = await TournamentDetailsPage({
      params: Promise.resolve({ id: tournament.id }),
      searchParams: Promise.resolve({ tab: "finished" }),
    });
    render(element);

    expect(screen.getByText("Past Home vs Past Away")).toBeInTheDocument();
    expect(screen.queryByText("Future Home vs Future Away")).not.toBeInTheDocument();
  });
});
