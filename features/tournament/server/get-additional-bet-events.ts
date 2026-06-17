import "server-only";

import { cacheTag } from "next/cache";

import type { AdditionalBetEventItem } from "@/features/tournament/types";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

export async function getAdditionalBetEvents(
    tournamentId: string,
    currentUserId: string,
): Promise<AdditionalBetEventItem[] | null> {
    "use cache";
    cacheTag(
        getCacheTag("additional-bet-events", { tournamentId }),
        getCacheTag("additional-bet-events-user", {
            tournamentId,
            userId: currentUserId,
        }),
    );

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: { id: true },
    });

    if (!tournament) {
        return null;
    }

    const events = await prisma.additionalBetEvent.findMany({
        where: { tournamentId },
        orderBy: { deadline: "asc" },
        include: {
            bets: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
    });

    const now = new Date();

    return events.map((event) => {
        const currentUserBet =
            event.bets.find((bet) => bet.userId === currentUserId)?.answer ??
            null;

        const isDeadlinePassed = event.deadline <= now;
        const otherUsersBets = isDeadlinePassed
            ? event.bets
                  .filter((bet) => bet.userId !== currentUserId)
                  .map((bet) => ({
                      userId: bet.user.id,
                      name: bet.user.name,
                      answer: bet.answer,
                  }))
            : [];

        return {
            id: event.id,
            tournamentId: event.tournamentId,
            name: event.name,
            deadline: event.deadline,
            points: event.points,
            answer: event.answer,
            createdAt: event.createdAt,
            currentUserBet,
            otherUsersBets,
        };
    });
}
