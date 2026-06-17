import "server-only";

import { cacheTag } from "next/cache";

import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

export interface TournamentMeta {
    id: string;
    name: string;
    season: string | null;
    exactScorePoints: number;
    correctOutcomePoints: number;
}

export async function getTournamentMeta(
    tournamentId: string,
): Promise<TournamentMeta | null> {
    "use cache";
    cacheTag(getCacheTag("tournament-meta", { tournamentId }));

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: {
            id: true,
            name: true,
            season: true,
            exactScorePoints: true,
            correctOutcomePoints: true,
        },
    });

    if (!tournament) {
        return null;
    }

    return tournament;
}
