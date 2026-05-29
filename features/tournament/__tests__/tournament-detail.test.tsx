import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TournamentDetailView } from "@/features/tournament/components/tournament-detail";
import type { TournamentDetail } from "@/features/tournament/server/get-tournament-detail";
import { makeGame, makeGroup, makeTournament } from "@/test/factories";

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
        game: { awayTeam: string; homeTeam: string; id: string };
    }) => (
        <div data-testid={`game-${game.id}`}>
            {game.homeTeam} — {game.awayTeam}
        </div>
    ),
}));

vi.mock("@/features/game/components/finished-game-card", () => ({
    FinishedGameCard: ({
        game,
    }: {
        game: { awayTeam: string; homeTeam: string; id: string };
    }) => (
        <div data-testid={`game-${game.id}`}>
            {game.homeTeam} — {game.awayTeam}
        </div>
    ),
}));

vi.mock("@/features/tournament/components/edit-tournament-dialog", () => ({
    EditTournamentDialog: () => null,
}));

vi.mock("@/features/game/components/create-game-dialog", () => ({
    CreateGameDialog: () => null,
}));

function makeTournamentDetail(
    games: ReturnType<typeof makeGame>[],
    isAdmin = false,
): TournamentDetail {
    const group = makeGroup({ name: "Grupa testowa" });
    const tournament = makeTournament({
        groupId: group.id,
        name: "Puchar testowy",
        season: "2025/26",
    });
    return {
        isAdmin,
        tournament: {
            ...tournament,
            group,
            games,
        },
    } as TournamentDetail;
}

describe("TournamentDetailView", () => {
    it("renders tournament header and tab labels", () => {
        const detail = makeTournamentDetail([]);
        render(
            <TournamentDetailView
                activeTab="upcoming"
                detail={detail}
                finishedGames={[]}
                upcomingGames={[]}
            />,
        );

        expect(
            screen.getByRole("heading", { name: "Puchar testowy" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Grupa testowa")).toBeInTheDocument();
        expect(screen.getByText("Sezon: 2025/26")).toBeInTheDocument();
        expect(screen.getByText("Nadchodzące mecze")).toBeInTheDocument();
        expect(screen.getByText("Zakończone mecze")).toBeInTheDocument();
    });

    it("shows empty copy for upcoming when there are no upcoming games", () => {
        const detail = makeTournamentDetail([]);
        render(
            <TournamentDetailView
                activeTab="upcoming"
                detail={detail}
                finishedGames={[]}
                upcomingGames={[]}
            />,
        );
        expect(
            screen.getByText("Brak nadchodzących meczów."),
        ).toBeInTheDocument();
    });

    it("lists upcoming games when active tab is upcoming", () => {
        const g = makeGame({
            awayTeam: "Goście",
            homeTeam: "Gospodarze",
            id: "game_u1",
        });
        const detail = makeTournamentDetail([g]);
        render(
            <TournamentDetailView
                activeTab="upcoming"
                detail={detail}
                finishedGames={[]}
                upcomingGames={[g]}
            />,
        );
        expect(screen.getByTestId("game-game_u1")).toHaveTextContent(
            "Gospodarze — Goście",
        );
    });

    it("shows empty copy for finished when there are no finished games", () => {
        const detail = makeTournamentDetail([]);
        render(
            <TournamentDetailView
                activeTab="finished"
                detail={detail}
                finishedGames={[]}
                upcomingGames={[]}
            />,
        );
        expect(
            screen.getByText("Brak zakończonych meczów."),
        ).toBeInTheDocument();
    });

    it("lists finished games when active tab is finished", () => {
        const g = makeGame({
            awayTeam: "B",
            homeTeam: "A",
            id: "game_f1",
        });
        const detail = makeTournamentDetail([g]);
        render(
            <TournamentDetailView
                activeTab="finished"
                detail={detail}
                finishedGames={[g]}
                upcomingGames={[]}
            />,
        );
        expect(screen.getByTestId("game-game_f1")).toHaveTextContent("A — B");
    });
});
