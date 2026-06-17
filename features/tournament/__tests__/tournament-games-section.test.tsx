import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { TournamentFinishedGamesSection } from "@/features/tournament/components/tournament-finished-games-section";
import { TournamentUpcomingGamesSection } from "@/features/tournament/components/tournament-upcoming-games-section";
import { getTournamentGames } from "@/features/tournament/server/get-tournament-games";
import { makeGame } from "@/test/factories";

vi.mock("@/features/tournament/server/get-tournament-games", () => ({
    getTournamentGames: vi.fn(),
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

describe("Tournament games sections", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("classifies games by kickoff and shows upcoming games in the upcoming section", async () => {
        const pastGame = makeGame({
            awayTeam: "Past Away",
            homeTeam: "Past Home",
            id: "game_past",
            kickoffAt: new Date("2026-06-10T12:00:00.000Z"),
            tournamentId: "t1",
        });
        const futureGame = makeGame({
            awayTeam: "Future Away",
            homeTeam: "Future Home",
            id: "game_future",
            kickoffAt: new Date("2026-06-20T12:00:00.000Z"),
            tournamentId: "t1",
        });
        vi.mocked(getTournamentGames).mockResolvedValue({
            groupMembers: [],
            games: [
                { ...pastGame, currentUserBet: null },
                { ...futureGame, currentUserBet: null },
            ],
        });

        render(
            await TournamentUpcomingGamesSection({
                currentUserId: "user_1",
                isAdmin: false,
                tournamentId: "t1",
            }),
        );

        expect(getTournamentGames).toHaveBeenCalledWith("t1", "user_1");

        expect(
            screen.getByText("Future Home vs Future Away"),
        ).toBeInTheDocument();
        expect(
            screen.queryByText("Past Home vs Past Away"),
        ).not.toBeInTheDocument();
    });

    it("shows only finished games in the finished section", async () => {
        const pastGame = makeGame({
            awayTeam: "Past Away",
            homeTeam: "Past Home",
            id: "game_past",
            kickoffAt: new Date("2026-06-10T12:00:00.000Z"),
            tournamentId: "t1",
        });
        const futureGame = makeGame({
            awayTeam: "Future Away",
            homeTeam: "Future Home",
            id: "game_future",
            kickoffAt: new Date("2026-06-20T12:00:00.000Z"),
            tournamentId: "t1",
        });
        vi.mocked(getTournamentGames).mockResolvedValue({
            groupMembers: [],
            games: [
                { ...pastGame, currentUserBet: null },
                { ...futureGame, currentUserBet: null },
            ],
        });

        render(
            await TournamentFinishedGamesSection({
                currentUserId: "user_1",
                isAdmin: false,
                tournamentId: "t1",
            }),
        );

        expect(getTournamentGames).toHaveBeenCalledWith("t1", "user_1");

        expect(screen.getByText("Past Home vs Past Away")).toBeInTheDocument();
        expect(
            screen.queryByText("Future Home vs Future Away"),
        ).not.toBeInTheDocument();
    });

    it("shows empty copy when there are no upcoming games", async () => {
        vi.mocked(getTournamentGames).mockResolvedValue({
            groupMembers: [],
            games: [],
        });

        render(
            await TournamentUpcomingGamesSection({
                currentUserId: "user_1",
                isAdmin: false,
                tournamentId: "t1",
            }),
        );

        expect(
            screen.getByText("Brak nadchodzących meczów."),
        ).toBeInTheDocument();
    });

    it("shows empty copy when there are no finished games", async () => {
        vi.mocked(getTournamentGames).mockResolvedValue({
            groupMembers: [],
            games: [],
        });

        render(
            await TournamentFinishedGamesSection({
                currentUserId: "user_1",
                isAdmin: false,
                tournamentId: "t1",
            }),
        );

        expect(
            screen.getByText("Brak zakończonych meczów."),
        ).toBeInTheDocument();
    });
});
