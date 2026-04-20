import "server-only";

import { prisma } from "@/lib/db";

export type TournamentDetail = NonNullable<
  Awaited<ReturnType<typeof getTournamentDetailForUser>>
>;

export async function getTournamentDetailForUser(
  tournamentId: string,
  userId: string,
) {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      scoringRule: true,
      games: { orderBy: { kickoffAt: "asc" } },
      group: true,
    },
  });

  if (!tournament) return null;

  const membership = await prisma.groupMember.findFirst({
    where: {
      userId,
      groupId: tournament.groupId,
    },
  });

  if (!membership) return null;

  return {
    tournament,
    isAdmin: membership.isAdmin,
  };
}
