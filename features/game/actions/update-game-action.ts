"use server";

import "server-only";

import { auth } from "@/lib/auth";
import { requireTournamentAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";
import { updateGame } from "@/features/game/server/update-game";
import type { GameParams } from "@/features/game/types";
import type { ServerActionResponse } from "@/lib/types";
import {
    getSuccessActionResponse,
    getErrorActionResponse,
} from "@/lib/server-action-response";

interface UpdateGameActionArgs extends Partial<GameParams> {
    gameId: string;
}

export async function updateGameAction(
    args: UpdateGameActionArgs,
): Promise<ServerActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return getErrorActionResponse("Wymagane uwierzytelnienie.");
    }

    const game = await prisma.game.findUnique({
        where: { id: args.gameId },
    });
    if (!game) {
        return getErrorActionResponse("Mecz nie został znaleziony.");
    }

    const adminResult = await requireTournamentAdmin(
        game.tournamentId,
        session.user.id,
    );
    if (!adminResult.ok) {
        return getErrorActionResponse(
            "Brak uprawnień administratora tej grupy.",
        );
    }

    try {
        await updateGame({
            gameId: args.gameId,
            homeTeam: args.homeTeam,
            awayTeam: args.awayTeam,
            kickoffAt: args.kickoffAt,
        });
        return getSuccessActionResponse();
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Nie udało się zaktualizować meczu.";
        return getErrorActionResponse(errorMessage);
    }
}
