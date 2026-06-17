import { cacheTag } from "next/cache";
import { describe, expect, it } from "vitest";

import { getTournamentGames } from "@/features/tournament/server/get-tournament-games";
import { getCacheTag } from "@/lib/cache-tags";
import { makeGame } from "@/test/factories";
import { prisma } from "@/test/prisma";

describe("getTournamentGames", () => {
    it("returns games with currentUserBet for the given user only", async () => {
        const game = makeGame({ id: "game_1" });
        const currentUserBet = {
            userId: "user_1",
            homeScore: 2,
            awayScore: 1,
            betResult: null,
        };
        prisma.tournament.findUnique.mockResolvedValue({
            id: "tournament_test_1",
            groupId: "group_test_1",
            games: [
                {
                    ...game,
                    bets: [currentUserBet],
                },
            ],
            group: {
                members: [
                    {
                        userId: "user_1",
                        user: { name: "Jan Kowalski" },
                    },
                ],
            },
        } as never);

        const result = await getTournamentGames("tournament_test_1", "user_1");

        expect(result).toEqual({
            games: [
                {
                    id: game.id,
                    homeTeam: game.homeTeam,
                    awayTeam: game.awayTeam,
                    kickoffAt: game.kickoffAt,
                    homeScore: game.homeScore,
                    awayScore: game.awayScore,
                    currentUserBet: {
                        userId: "user_1",
                        homeScore: 2,
                        awayScore: 1,
                        betResult: null,
                    },
                },
            ],
            groupMembers: [{ userId: "user_1", name: "Jan Kowalski" }],
        });
    });

    it("returns null currentUserBet when the user has no bet", async () => {
        const game = makeGame({ id: "game_1" });
        prisma.tournament.findUnique.mockResolvedValue({
            id: "tournament_test_1",
            groupId: "group_test_1",
            games: [{ ...game, bets: [] }],
            group: { members: [] },
        } as never);

        const result = await getTournamentGames("tournament_test_1", "user_1");

        expect(result?.games[0].currentUserBet).toBeNull();
    });

    it("returns null when tournament is not found", async () => {
        prisma.tournament.findUnique.mockResolvedValue(null);

        const result = await getTournamentGames("missing", "user_1");

        expect(result).toBeNull();
    });

    it("applies dual cache tags", async () => {
        prisma.tournament.findUnique.mockResolvedValue(null);

        await getTournamentGames("tournament_test_1", "user_1");

        expect(cacheTag).toHaveBeenCalledWith(
            getCacheTag("tournament-games", {
                tournamentId: "tournament_test_1",
            }),
            getCacheTag("tournament-user-games", {
                tournamentId: "tournament_test_1",
                userId: "user_1",
            }),
        );
    });
});
