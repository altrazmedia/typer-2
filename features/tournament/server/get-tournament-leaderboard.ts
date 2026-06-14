import "server-only";

import { BetResult } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import type { LeaderboardEntry } from "@/features/tournament/types";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

interface MemberWithUser {
    userId: string;
    name: string;
}

interface BetWithResult {
    userId: string;
    betResult: BetResult | null;
}

interface ScoringConfig {
    exactScorePoints: number;
    correctOutcomePoints: number;
}

export type LeaderboardRow = Omit<LeaderboardEntry, "rank">;

export function aggregateLeaderboardEntries(
    members: MemberWithUser[],
    bets: BetWithResult[],
    scoring: ScoringConfig,
): LeaderboardRow[] {
    const countsByUser = new Map<
        string,
        { exactScoreBets: number; correctOutcomeBets: number }
    >();

    for (const member of members) {
        countsByUser.set(member.userId, {
            exactScoreBets: 0,
            correctOutcomeBets: 0,
        });
    }

    for (const bet of bets) {
        if (bet.betResult === null) {
            continue;
        }

        const counts = countsByUser.get(bet.userId);
        if (!counts) {
            continue;
        }

        if (bet.betResult === BetResult.EXACT_SCORE) {
            counts.exactScoreBets++;
        } else if (bet.betResult === BetResult.CORRECT_OUTCOME) {
            counts.correctOutcomeBets++;
        }
    }

    const entries = members.map((member) => {
        const counts = countsByUser.get(member.userId)!;
        const totalPoints =
            counts.exactScoreBets * scoring.exactScorePoints +
            counts.correctOutcomeBets * scoring.correctOutcomePoints;

        return {
            userId: member.userId,
            name: member.name,
            exactScoreBets: counts.exactScoreBets,
            correctOutcomeBets: counts.correctOutcomeBets,
            totalPoints,
        };
    });

    entries.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) {
            return b.totalPoints - a.totalPoints;
        }
        return b.exactScoreBets - a.exactScoreBets;
    });

    return entries;
}

export function assignStandardRanks(
    rows: LeaderboardRow[],
): LeaderboardEntry[] {
    const result: LeaderboardEntry[] = [];

    for (let i = 0; i < rows.length; i++) {
        let rank: number;
        if (i === 0) {
            rank = 1;
        } else {
            const prev = rows[i - 1];
            const curr = rows[i];
            if (
                curr.totalPoints === prev.totalPoints &&
                curr.exactScoreBets === prev.exactScoreBets
            ) {
                rank = result[i - 1].rank;
            } else {
                rank = i + 1;
            }
        }
        result.push({ ...rows[i], rank });
    }

    return result;
}

export async function getTournamentLeaderboard(
    tournamentId: string,
): Promise<LeaderboardEntry[] | null> {
    "use cache";
    cacheTag(getCacheTag("leaderboard", { tournamentId }));
    cacheLife("days");

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: {
            groupId: true,
            exactScorePoints: true,
            correctOutcomePoints: true,
        },
    });

    if (!tournament) {
        return null;
    }

    const members = await prisma.groupMember.findMany({
        where: { groupId: tournament.groupId },
        select: {
            userId: true,
            user: { select: { name: true } },
        },
    });

    const bets = await prisma.bet.findMany({
        where: {
            game: { tournamentId },
            betResult: { not: null },
        },
        select: {
            userId: true,
            betResult: true,
        },
    });

    const aggregated = aggregateLeaderboardEntries(
        members.map((member) => ({
            userId: member.userId,
            name: member.user.name,
        })),
        bets,
        {
            exactScorePoints: tournament.exactScorePoints,
            correctOutcomePoints: tournament.correctOutcomePoints,
        },
    );

    return assignStandardRanks(aggregated);
}
