import "server-only";

import type { Prisma } from "@prisma/client";

import { computeBetPointsUpdates } from "@/features/game/scoring";

export async function awardGamePoints(
    gameId: string,
    tx: Prisma.TransactionClient,
): Promise<void> {
    const game = await tx.game.findUnique({
        where: { id: gameId },
        include: {
            tournament: true,
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
    const rule = {
        exactScorePoints: game.tournament.exactScorePoints,
        correctOutcomePoints: game.tournament.correctOutcomePoints,
    };

    const updates = computeBetPointsUpdates(game.bets, actual, rule);

    await Promise.all(
        updates.map(({ betId, pointsAwarded }) =>
            tx.bet.update({
                where: { id: betId },
                data: { pointsAwarded },
            }),
        ),
    );
}
