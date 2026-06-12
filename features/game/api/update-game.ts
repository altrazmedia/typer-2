import "server-only";

import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

import { parseUpdateGameBody } from "@/features/game/schema";
import { updateGame as updateGameInDb } from "@/features/game/server/update-game";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function updateGame(request: Request, context: RouteContext) {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;

    const { id: gameId } = await context.params;

    const game = await prisma.game.findUnique({
        where: { id: gameId },
    });
    if (!game) {
        return NextResponse.json(
            { error: "Mecz nie został znaleziony." },
            { status: 404 },
        );
    }

    const adminResult = await requireTournamentAdmin(
        game.tournamentId,
        session.user.id,
    );
    if (!adminResult.ok) {
        return NextResponse.json(
            { error: "Brak uprawnień administratora tej grupy." },
            { status: 403 },
        );
    }

    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowy format żądania." },
            { status: 400 },
        );
    }

    const parsed = parseUpdateGameBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj co najmniej jedno pole do aktualizacji." },
            { status: 400 },
        );
    }

    const updated = await updateGameInDb({
        gameId,
        homeTeam: parsed.homeTeam,
        awayTeam: parsed.awayTeam,
        kickoffAt: parsed.kickoffAt,
    });

    return NextResponse.json({ game: updated });
}
