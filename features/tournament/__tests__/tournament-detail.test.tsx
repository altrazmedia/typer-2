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
        userBet,
    }: {
        game: { awayTeam: string; homeTeam: string; id: string };
        userBet: { awayScore: number; homeScore: number } | null;
    }) => (
        <div
            data-testid={`game-${game.id}`}
            data-user-bet={
                userBet ? `${userBet.homeScore}-${userBet.awayScore}` : "none"
            }
        >
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

vi.mock("@/features/tournament/components/leaderboard-table", () => ({
    LeaderboardTable: ({
        leaderboard,
    }: {
        leaderboard: { name: string; rank: number; totalPoints: number }[];
    }) => (
        <div data-testid="leaderboard-table">
            {leaderboard.map((entry) => (
                <div
                    key={entry.rank}
                    data-testid={`leaderboard-row-${entry.rank}`}
                >
                    {entry.rank} {entry.name} {entry.totalPoints}
                </div>
            ))}
        </div>
    ),
}));

type TournamentGameRow = TournamentDetail["tournament"]["games"][number];

function makeGameRow(
    overrides: Parameters<typeof makeGame>[0] = {},
): TournamentGameRow {
    return { ...makeGame(overrides), bets: [] };
}

function makeTournamentDetail(
    games: TournamentGameRow[],
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
        groupMembers: [],
        tournament: {
            ...tournament,
            group: {
                ...group,
                members: [],
            },
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
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[]}
                leaderboard={[]}
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
        expect(screen.getByText("Tabela")).toBeInTheDocument();
    });

    it("shows empty copy for upcoming when there are no upcoming games", () => {
        const detail = makeTournamentDetail([]);
        render(
            <TournamentDetailView
                activeTab="upcoming"
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[]}
                leaderboard={[]}
                upcomingGames={[]}
            />,
        );
        expect(
            screen.getByText("Brak nadchodzących meczów."),
        ).toBeInTheDocument();
    });

    it("lists upcoming games when active tab is upcoming", () => {
        const g = makeGameRow({
            awayTeam: "Goście",
            homeTeam: "Gospodarze",
            id: "game_u1",
        });
        const detail = makeTournamentDetail([g]);
        render(
            <TournamentDetailView
                activeTab="upcoming"
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[]}
                leaderboard={[]}
                upcomingGames={[g]}
            />,
        );
        expect(screen.getByTestId("game-game_u1")).toHaveTextContent(
            "Gospodarze — Goście",
        );
    });

    it("passes only the current user bet to upcoming game cards", () => {
        const g = {
            ...makeGameRow({
                awayTeam: "Goście",
                homeTeam: "Gospodarze",
                id: "game_u1",
            }),
            bets: [
                {
                    userId: "user_1",
                    homeScore: 1,
                    awayScore: 0,
                    betResult: null,
                },
                {
                    userId: "user_2",
                    homeScore: 2,
                    awayScore: 2,
                    betResult: null,
                },
            ],
        };
        const detail = makeTournamentDetail([g]);
        render(
            <TournamentDetailView
                activeTab="upcoming"
                currentUserId="user_1"
                detail={detail}
                finishedGames={[]}
                leaderboard={[]}
                upcomingGames={[g]}
            />,
        );

        expect(screen.getByTestId("game-game_u1")).toHaveAttribute(
            "data-user-bet",
            "1-0",
        );
    });

    it("shows empty copy for finished when there are no finished games", () => {
        const detail = makeTournamentDetail([]);
        render(
            <TournamentDetailView
                activeTab="finished"
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[]}
                leaderboard={[]}
                upcomingGames={[]}
            />,
        );
        expect(
            screen.getByText("Brak zakończonych meczów."),
        ).toBeInTheDocument();
    });

    it("lists finished games when active tab is finished", () => {
        const g = makeGameRow({
            awayTeam: "B",
            homeTeam: "A",
            id: "game_f1",
        });
        const detail = makeTournamentDetail([g]);
        render(
            <TournamentDetailView
                activeTab="finished"
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[g]}
                leaderboard={[]}
                upcomingGames={[]}
            />,
        );
        expect(screen.getByTestId("game-game_f1")).toHaveTextContent("A — B");
    });

    it("renders leaderboard table when active tab is leaderboard", () => {
        const detail = makeTournamentDetail([]);
        const leaderboard = [
            {
                rank: 1,
                userId: "user_1",
                name: "Jan Kowalski",
                exactScoreBets: 2,
                correctOutcomeBets: 3,
                totalPoints: 11,
            },
            {
                rank: 2,
                userId: "user_2",
                name: "Anna Nowak",
                exactScoreBets: 1,
                correctOutcomeBets: 2,
                totalPoints: 7,
            },
        ];
        render(
            <TournamentDetailView
                activeTab="leaderboard"
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[]}
                leaderboard={leaderboard}
                upcomingGames={[]}
            />,
        );

        expect(screen.getByTestId("leaderboard-table")).toBeInTheDocument();
        expect(screen.getByTestId("leaderboard-row-1")).toHaveTextContent(
            "1 Jan Kowalski 11",
        );
        expect(screen.getByTestId("leaderboard-row-2")).toHaveTextContent(
            "2 Anna Nowak 7",
        );
        expect(
            screen.queryByText("Brak nadchodzących meczów."),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText("Brak zakończonych meczów."),
        ).not.toBeInTheDocument();
    });

    it("hides games list when active tab is tabela", () => {
        const g = makeGameRow({
            awayTeam: "B",
            homeTeam: "A",
            id: "game_u1",
        });
        const detail = makeTournamentDetail([g]);
        render(
            <TournamentDetailView
                activeTab="leaderboard"
                currentUserId="user_test_1"
                detail={detail}
                finishedGames={[g]}
                leaderboard={[]}
                upcomingGames={[g]}
            />,
        );

        expect(screen.getByTestId("leaderboard-table")).toBeInTheDocument();
        expect(screen.queryByTestId("game-game_u1")).not.toBeInTheDocument();
    });
});
