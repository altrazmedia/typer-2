import "server-only";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

import { parseUpdateTournamentBody } from "@/features/tournament/schema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function updateTournament(
    request: Request,
    context: RouteContext,
) {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;

    const { id: tournamentId } = await context.params;

    const adminResult = await requireTournamentAdmin(
        tournamentId,
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

    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Nieprawidłowy format żądania." },
            { status: 400 },
        );
    }

    const parsed = parseUpdateTournamentBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj co najmniej jedno pole do aktualizacji." },
            { status: 400 },
        );
    }

    const data: {
        name?: string;
        season?: string | null;
        exactScorePoints?: number;
        correctOutcomePoints?: number;
    } = {};

    if (parsed.name !== undefined) data.name = parsed.name;
    if (parsed.season !== undefined) data.season = parsed.season;
    if (parsed.exactScorePoints !== undefined) {
        data.exactScorePoints = parsed.exactScorePoints;
    }
    if (parsed.correctOutcomePoints !== undefined) {
        data.correctOutcomePoints = parsed.correctOutcomePoints;
    }

    const tournament = await prisma.tournament.update({
        where: { id: tournamentId },
        data,
    });

    revalidateTag(
        getCacheTag("tournaments-for-group", {
            groupId: adminResult.tournament.groupId,
        }),
        "max",
    );

    return NextResponse.json({ tournament });
}
