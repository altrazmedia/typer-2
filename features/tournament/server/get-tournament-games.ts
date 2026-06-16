import "server-only";

import { BetResult } from "@prisma/client";
import { cacheTag } from "next/cache";

import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

export interface TournamentGameBet {
    userId: string;
    homeScore: number;
    awayScore: number;
    betResult: BetResult | null;
}

export interface TournamentGame {
    id: string;
    homeTeam: string;
    awayTeam: string;
    kickoffAt: Date;
    homeScore: number | null;
    awayScore: number | null;
    currentUserBet: TournamentGameBet | null;
}

export interface TournamentGroupMember {
    userId: string;
    name: string;
}

export interface TournamentGamesData {
    games: TournamentGame[];
    groupMembers: TournamentGroupMember[];
}

export async function getTournamentGames(
    tournamentId: string,
    currentUserId: string,
): Promise<TournamentGamesData | null> {
    "use cache";
    cacheTag(
        getCacheTag("tournament-games", { tournamentId }),
        getCacheTag("tournament-user-games", {
            tournamentId,
            userId: currentUserId,
        }),
    );

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        include: {
            games: {
                orderBy: { kickoffAt: "asc" },
                include: {
                    bets: {
                        where: { userId: currentUserId },
                        select: {
                            userId: true,
                            homeScore: true,
                            awayScore: true,
                            betResult: true,
                        },
                        take: 1,
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

    if (!tournament) {
        return null;
    }

    const groupMembers = tournament.group.members.map((member) => ({
        userId: member.userId,
        name: member.user.name,
    }));

    const games = tournament.games.map((game) => {
        const bet = game.bets[0];

        return {
            id: game.id,
            homeTeam: game.homeTeam,
            awayTeam: game.awayTeam,
            kickoffAt: game.kickoffAt,
            homeScore: game.homeScore,
            awayScore: game.awayScore,
            currentUserBet: bet
                ? {
                      userId: bet.userId,
                      homeScore: bet.homeScore,
                      awayScore: bet.awayScore,
                      betResult: bet.betResult,
                  }
                : null,
        };
    });

    return {
        games,
        groupMembers,
    };
}
