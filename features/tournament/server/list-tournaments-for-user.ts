import "server-only";

import { prisma } from "@/lib/db";

import type { TournamentGroupSection } from "@/features/tournament/types";

export async function listTournamentsForUser(
  userId: string,
): Promise<TournamentGroupSection[]> {
  const memberships = await prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          tournaments: {
            orderBy: { createdAt: "desc" },
            include: {
              _count: { select: { games: true } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return memberships.map((m) => ({
    groupId: m.groupId,
    groupName: m.group.name,
    isAdmin: m.isAdmin,
    tournaments: m.group.tournaments.map((t) => ({
      id: t.id,
      name: t.name,
      season: t.season,
      gameCount: t._count.games,
    })),
  }));
}
