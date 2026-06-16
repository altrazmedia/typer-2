import "server-only";

import { cacheTag } from "next/cache";

import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

import type { GameBetRow } from "@/features/game/types";

export async function getGameBets(gameId: string): Promise<GameBetRow[]> {
    "use cache";
    cacheTag(getCacheTag("game-bets", { gameId }));

    const game = await prisma.game.findUnique({
        where: { id: gameId },
        select: {
            kickoffAt: true,
            bets: {
                select: {
                    userId: true,
                    homeScore: true,
                    awayScore: true,
                    betResult: true,
                },
            },
        },
    });

    if (!game) {
        throw new Error("Mecz nie został znaleziony.");
    }

    const now = new Date();
    if (game.kickoffAt > now) {
        throw new Error("Mecz nie został jeszcze zakończony.");
    }

    return game.bets;
}
