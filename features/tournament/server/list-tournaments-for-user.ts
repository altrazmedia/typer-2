import "server-only";

import { cacheTag } from "next/cache";

import type { TournamentGroupSection } from "@/features/tournament/types";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

export async function listTournamentsForUser(
    userId: string,
): Promise<TournamentGroupSection[]> {
    "use cache";

    const memberships = await prisma.groupMember.findMany({
        where: { userId },
        include: {
            group: {
                include: {
                    tournaments: {
                        orderBy: { createdAt: "desc" },
                    },
                },
            },
        },
        orderBy: { joinedAt: "asc" },
    });

    for (const membership of memberships) {
        cacheTag(
            getCacheTag("tournaments-for-group", {
                groupId: membership.groupId,
            }),
        );
    }

    return memberships.map((m) => ({
        groupId: m.groupId,
        groupName: m.group.name,
        isAdmin: m.isAdmin,
        tournaments: m.group.tournaments.map((t) => ({
            id: t.id,
            name: t.name,
            season: t.season,
        })),
    }));
}
