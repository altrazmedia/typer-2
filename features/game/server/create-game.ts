import "server-only";

import type { Game } from "@prisma/client";
import { revalidateTag } from "next/cache";

import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

import { parseKickoffAtUtc } from "@/features/game/helpers/parse-kickoff-at-utc";
import type { GameParams } from "@/features/game/types";

export interface CreateGameArgs extends GameParams {
    tournamentId: string;
}

function validateArgs(args: CreateGameArgs): void {
    if (!args.tournamentId.trim()) {
        throw new Error("Identyfikator turnieju jest wymagany.");
    }
    if (!args.homeTeam.trim()) {
        throw new Error("Drużyna gospodarzy jest wymagana.");
    }
    if (!args.awayTeam.trim()) {
        throw new Error("Drużyna gości jest wymagana.");
    }
}

export async function createGame(args: CreateGameArgs): Promise<Game> {
    validateArgs(args);

    const game = await prisma.game.create({
        data: {
            tournamentId: args.tournamentId.trim(),
            homeTeam: args.homeTeam.trim(),
            awayTeam: args.awayTeam.trim(),
            kickoffAt: parseKickoffAtUtc(args.kickoffAt),
        },
    });

    revalidateTag(
        getCacheTag("tournament-games", {
            tournamentId: game.tournamentId,
        }),
        "max",
    );

    return game;
}
