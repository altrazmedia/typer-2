import "server-only";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth, requireTournamentAdmin } from "@/lib/api-utils";
import { getCacheTag } from "@/lib/cache-tags";
import { prisma } from "@/lib/db";

import { awardGamePoints } from "@/features/game/api/award-game-points";
import { parseSubmitResultBody } from "@/features/game/schema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function submitGameResult(
    request: Request,
    context: RouteContext,
) {
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

    const parsed = parseSubmitResultBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj prawidłowy wynik (liczby całkowite ≥ 0)." },
            { status: 400 },
        );
    }

    const updated = await prisma.$transaction(async (tx) => {
        const game = await tx.game.update({
            where: { id: gameId },
            data: {
                homeScore: parsed.homeScore,
                awayScore: parsed.awayScore,
            },
        });
        await awardGamePoints(gameId, tx);
        return game;
    });

    revalidateTag(
        getCacheTag("leaderboard", { tournamentId: game.tournamentId }),
        "max",
    );
    revalidateTag(
        getCacheTag("tournament-games", { tournamentId: game.tournamentId }),
        "max",
    );

    return NextResponse.json({ game: updated });
}
