import { cacheTag } from "next/cache";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getGameBets } from "@/features/game/server/get-game-bets";
import { getCacheTag } from "@/lib/cache-tags";
import { makeGame } from "@/test/factories";
import { prisma } from "@/test/prisma";

describe("getGameBets", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("returns all bets for a finished game", async () => {
        const bets = [
            {
                userId: "u1",
                homeScore: 2,
                awayScore: 1,
                betResult: null,
            },
            {
                userId: "u2",
                homeScore: 0,
                awayScore: 0,
                betResult: null,
            },
        ];
        prisma.game.findUnique.mockResolvedValue({
            kickoffAt: new Date("2026-06-10T12:00:00.000Z"),
            bets,
        } as never);

        const result = await getGameBets("game_1");

        expect(result).toEqual(bets);
    });

    it("throws when game is not found", async () => {
        prisma.game.findUnique.mockResolvedValue(null);

        await expect(getGameBets("missing")).rejects.toThrow(
            "Mecz nie został znaleziony.",
        );
    });

    it("throws when kickoff is in the future", async () => {
        prisma.game.findUnique.mockResolvedValue({
            ...makeGame({
                kickoffAt: new Date("2026-06-20T12:00:00.000Z"),
            }),
            bets: [],
        } as never);

        await expect(getGameBets("game_future")).rejects.toThrow(
            "Mecz nie został jeszcze zakończony.",
        );
    });

    it("applies game-bets cache tag", async () => {
        prisma.game.findUnique.mockResolvedValue({
            kickoffAt: new Date("2026-06-10T12:00:00.000Z"),
            bets: [],
        } as never);

        await getGameBets("game_1");

        expect(cacheTag).toHaveBeenCalledWith(
            getCacheTag("game-bets", { gameId: "game_1" }),
        );
    });
});
