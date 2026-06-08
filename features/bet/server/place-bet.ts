import "server-only";

import { prisma } from "@/lib/db";

export type PlaceBetResult =
    | { ok: true; homeScore: number; awayScore: number }
    | {
          ok: false;
          error: string;
          code: "NOT_FOUND" | "FORBIDDEN" | "BAD_REQUEST";
      };

export async function placeBetForUser(
    userId: string,
    gameId: string,
    homeScore: number,
    awayScore: number,
): Promise<PlaceBetResult> {
    const game = await prisma.game.findUnique({
        where: { id: gameId },
        include: {
            tournament: { select: { groupId: true } },
        },
    });

    if (!game) {
        return {
            ok: false,
            error: "Mecz nie został znaleziony.",
            code: "NOT_FOUND",
        };
    }

    const membership = await prisma.groupMember.findFirst({
        where: {
            userId,
            groupId: game.tournament.groupId,
        },
    });

    if (!membership) {
        return {
            ok: false,
            error: "Brak dostępu do tej grupy.",
            code: "FORBIDDEN",
        };
    }

    const now = new Date();
    if (game.kickoffAt <= now) {
        return {
            ok: false,
            error: "Nie można obstawiać meczu po rozpoczęciu.",
            code: "BAD_REQUEST",
        };
    }

    await prisma.bet.upsert({
        where: {
            gameId_userId: { gameId, userId },
        },
        create: {
            gameId,
            userId,
            homeScore,
            awayScore,
        },
        update: {
            homeScore,
            awayScore,
        },
    });

    return { ok: true, homeScore, awayScore };
}
