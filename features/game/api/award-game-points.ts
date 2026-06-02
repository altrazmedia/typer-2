import "server-only";

import type { Prisma } from "@prisma/client";

import { computeBetResults } from "@/features/game/scoring";

export async function awardGamePoints(
    gameId: string,
    tx: Prisma.TransactionClient,
): Promise<void> {
    const game = await tx.game.findUnique({
        where: { id: gameId },
        include: {
            bets: true,
        },
    });

    if (!game) {
        throw new Error(`Mecz nie został znaleziony: ${gameId}`);
    }

    if (game.homeScore === null || game.awayScore === null) {
        return;
    }

    const actual = { homeScore: game.homeScore, awayScore: game.awayScore };
    const updates = computeBetResults(game.bets, actual);

    await Promise.all(
        updates.map(({ betId, betResult }) =>
            tx.bet.update({
                where: { id: betId },
                data: { betResult },
            }),
        ),
    );
}
