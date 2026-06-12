import "server-only";

import type { Game } from "@prisma/client";

import { prisma } from "@/lib/db";

import { parseKickoffAtUtc } from "@/features/game/helpers/parse-kickoff-at-utc";
import type { GameParams } from "@/features/game/types";

export interface UpdateGameArgs extends Partial<GameParams> {
    gameId: string;
}

function validateArgs(args: UpdateGameArgs): void {
    if (!args.gameId.trim()) {
        throw new Error("Identyfikator meczu jest wymagany.");
    }
    if (
        args.homeTeam === undefined &&
        args.awayTeam === undefined &&
        args.kickoffAt === undefined
    ) {
        throw new Error("Podaj co najmniej jedno pole do aktualizacji.");
    }
    if (args.homeTeam !== undefined && !args.homeTeam.trim()) {
        throw new Error("Drużyna gospodarzy nie może być pusta.");
    }
    if (args.awayTeam !== undefined && !args.awayTeam.trim()) {
        throw new Error("Drużyna gości nie może być pusta.");
    }
}

export async function updateGame(args: UpdateGameArgs): Promise<Game> {
    validateArgs(args);

    return prisma.game.update({
        where: { id: args.gameId.trim() },
        data: {
            ...(args.homeTeam !== undefined
                ? { homeTeam: args.homeTeam.trim() }
                : {}),
            ...(args.awayTeam !== undefined
                ? { awayTeam: args.awayTeam.trim() }
                : {}),
            ...(args.kickoffAt !== undefined
                ? { kickoffAt: parseKickoffAtUtc(args.kickoffAt) }
                : {}),
        },
    });
}
