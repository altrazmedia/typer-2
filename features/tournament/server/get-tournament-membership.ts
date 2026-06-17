import "server-only";

import { cacheTag } from "next/cache";

import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

export interface TournamentMembership {
    isAdmin: boolean;
}

export async function getTournamentMembership(
    tournamentId: string,
    userId: string,
): Promise<TournamentMembership | null> {
    "use cache";
    cacheTag(getCacheTag("tournament-membership", { tournamentId, userId }));

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: { groupId: true },
    });

    if (!tournament) {
        return null;
    }

    const membership = await prisma.groupMember.findFirst({
        where: {
            userId,
            groupId: tournament.groupId,
        },
        select: { isAdmin: true },
    });

    if (!membership) {
        return null;
    }

    return { isAdmin: membership.isAdmin };
}
