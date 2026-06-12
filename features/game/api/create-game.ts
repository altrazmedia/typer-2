import "server-only";

import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";

import { parseCreateGameBody } from "@/features/game/schema";
import { createGame as createGameInDb } from "@/features/game/server/create-game";

export async function createGame(request: Request) {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;

    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowy format żądania." },
            { status: 400 },
        );
    }

    const parsed = parseCreateGameBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj prawidłowe dane meczu." },
            { status: 400 },
        );
    }

    const adminResult = await requireTournamentAdmin(
        parsed.tournamentId,
        session.user.id,
    );
    if (!adminResult.ok) {
        if (adminResult.reason === "not_found") {
            return NextResponse.json(
                { error: "Turniej nie został znaleziony." },
                { status: 404 },
            );
        }
        return NextResponse.json(
            { error: "Brak uprawnień administratora tej grupy." },
            { status: 403 },
        );
    }

    const game = await createGameInDb({
        tournamentId: parsed.tournamentId,
        homeTeam: parsed.homeTeam,
        awayTeam: parsed.awayTeam,
        kickoffAt: parsed.kickoffAt,
    });

    return NextResponse.json({ game }, { status: 201 });
}
