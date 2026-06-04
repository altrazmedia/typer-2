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
            games: {
                orderBy: { kickoffAt: "asc" },
                include: {
                    bets: {
                        select: {
                            userId: true,
                            homeScore: true,
                            awayScore: true,
                            betResult: true,
                        },
                    },
                },
            },
            group: {
                include: {
                    members: {
                        select: {
                            userId: true,
                            user: { select: { name: true } },
                        },
                    },
                },
            },
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

    const groupMembers = tournament.group.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
    }));

    return {
        tournament,
        groupMembers,
        isAdmin: membership.isAdmin,
    };
}
