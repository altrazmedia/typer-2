import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TournamentDetailsContent } from "@/features/tournament/pages/tournament-details-page";
import { getTournamentDetailForUser } from "@/features/tournament/server/get-tournament-detail";
import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeGame, makeGroup, makeTournament } from "@/test/factories";

vi.mock("@/features/tournament/server/get-tournament-detail", () => ({
    getTournamentDetailForUser: vi.fn(),
}));

vi.mock("@/features/tournament/server/get-tournament-leaderboard", () => ({
    getTournamentLeaderboard: vi.fn(),
}));

vi.mock("@/features/tournament/components/leaderboard-table", () => ({
    LeaderboardTable: ({
        leaderboard,
    }: {
        leaderboard: { name: string; rank: number }[];
    }) => (
        <div data-testid="leaderboard-table">
            {leaderboard.map((entry) => (
                <span key={entry.rank}>{entry.name}</span>
            ))}
        </div>
    ),
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
    UpcomingGameCard: ({
        game,
    }: {
        game: { awayTeam: string; homeTeam: string };
    }) => (
        <div>
            {game.homeTeam} vs {game.awayTeam}
        </div>
    ),
}));

vi.mock("@/features/game/components/finished-game-card", () => ({
    FinishedGameCard: ({
        game,
    }: {
        game: { awayTeam: string; homeTeam: string };
    }) => (
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
            TournamentDetailsContent({
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
            TournamentDetailsContent({
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
            groupMembers: [],
            tournament: {
                ...tournament,
                group: {
                    ...group,
                    members: [],
                },
                games: [
                    {
                        ...pastGame,
                        bets: [],
                    },
                    {
                        ...futureGame,
                        bets: [],
                    },
                ],
            },
        } as Awaited<ReturnType<typeof getTournamentDetailForUser>>);

        render(
            await TournamentDetailsContent({
                params: Promise.resolve({ id: tournament.id }),
                searchParams: Promise.resolve({}),
            }),
        );

        expect(
            screen.getByText("Future Home vs Future Away"),
        ).toBeInTheDocument();
        expect(
            screen.queryByText("Past Home vs Past Away"),
        ).not.toBeInTheDocument();
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
            groupMembers: [],
            tournament: {
                ...tournament,
                group: {
                    ...group,
                    members: [],
                },
                games: [
                    {
                        ...pastGame,
                        bets: [],
                    },
                    {
                        ...futureGame,
                        bets: [],
                    },
                ],
            },
        } as Awaited<ReturnType<typeof getTournamentDetailForUser>>);

        render(
            await TournamentDetailsContent({
                params: Promise.resolve({ id: tournament.id }),
                searchParams: Promise.resolve({ tab: "finished" }),
            }),
        );

        expect(screen.getByText("Past Home vs Past Away")).toBeInTheDocument();
        expect(
            screen.queryByText("Future Home vs Future Away"),
        ).not.toBeInTheDocument();
    });

    it("fetches leaderboard and shows table when ?tab=leaderboard", async () => {
        mockAuthedUser({ id: "user_1" });
        const group = makeGroup();
        const tournament = makeTournament({ groupId: group.id });
        vi.mocked(getTournamentDetailForUser).mockResolvedValue({
            isAdmin: false,
            groupMembers: [],
            tournament: {
                ...tournament,
                group: {
                    ...group,
                    members: [],
                },
                games: [],
            },
        } as Awaited<ReturnType<typeof getTournamentDetailForUser>>);
        vi.mocked(getTournamentLeaderboard).mockResolvedValue([
            {
                rank: 1,
                userId: "user_1",
                name: "Jan Kowalski",
                exactScoreBets: 2,
                correctOutcomeBets: 1,
                totalPoints: 9,
            },
        ]);

        render(
            await TournamentDetailsContent({
                params: Promise.resolve({ id: tournament.id }),
                searchParams: Promise.resolve({ tab: "leaderboard" }),
            }),
        );

        expect(getTournamentLeaderboard).toHaveBeenCalledWith(tournament.id);
        expect(screen.getByTestId("leaderboard-table")).toBeInTheDocument();
        expect(screen.getByText("Jan Kowalski")).toBeInTheDocument();
        expect(screen.getByText("Tabela")).toBeInTheDocument();
    });

    it("does not fetch leaderboard on default tab", async () => {
        mockAuthedUser({ id: "user_1" });
        const group = makeGroup();
        const tournament = makeTournament({ groupId: group.id });
        vi.mocked(getTournamentDetailForUser).mockResolvedValue({
            isAdmin: false,
            groupMembers: [],
            tournament: {
                ...tournament,
                group: {
                    ...group,
                    members: [],
                },
                games: [],
            },
        } as Awaited<ReturnType<typeof getTournamentDetailForUser>>);

        await TournamentDetailsContent({
            params: Promise.resolve({ id: tournament.id }),
            searchParams: Promise.resolve({}),
        });

        expect(getTournamentLeaderboard).not.toHaveBeenCalled();
    });
});
