"use server";

import "server-only";

import { auth } from "@/lib/auth";
import { requireTournamentAdmin } from "@/lib/api-utils";
import { createGame } from "@/features/game/server/create-game";
import type { GameParams } from "@/features/game/types";
import type { ServerActionResponse } from "@/lib/types";
import {
    getSuccessActionResponse,
    getErrorActionResponse,
} from "@/lib/server-action-response";

interface CreateGameActionArgs extends GameParams {
    tournamentId: string;
}

export async function createGameAction(
    args: CreateGameActionArgs,
): Promise<ServerActionResponse> {
    const session = await auth();
    if (!session?.user?.id) {
        return getErrorActionResponse("Wymagane uwierzytelnienie.");
    }

    const adminResult = await requireTournamentAdmin(
        args.tournamentId,
        session.user.id,
    );
    if (!adminResult.ok) {
        if (adminResult.reason === "not_found") {
            return getErrorActionResponse("Turniej nie został znaleziony.");
        }
        return getErrorActionResponse(
            "Brak uprawnień administratora tej grupy.",
        );
    }

    try {
        await createGame({
            tournamentId: args.tournamentId,
            homeTeam: args.homeTeam,
            awayTeam: args.awayTeam,
            kickoffAt: args.kickoffAt,
        });
        return getSuccessActionResponse();
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error
                ? error.message
                : "Nie udało się utworzyć meczu.";
        return getErrorActionResponse(errorMessage);
    }
}
