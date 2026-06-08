import "server-only";

import { NextResponse } from "next/server";

import { placeBetForUser } from "@/features/bet/server/place-bet";
import { parsePlaceBetBody } from "@/features/bet/schema";
import { requireAuth } from "@/lib/api-utils";

export async function placeBet(request: Request) {
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

    const parsed = parsePlaceBetBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj prawidłowe dane zakładu." },
            { status: 400 },
        );
    }

    const result = await placeBetForUser(
        session.user.id,
        parsed.gameId,
        parsed.homeScore,
        parsed.awayScore,
    );

    if (!result.ok) {
        const status =
            result.code === "NOT_FOUND"
                ? 404
                : result.code === "FORBIDDEN"
                  ? 403
                  : 400;
        return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json({
        homeScore: result.homeScore,
        awayScore: result.awayScore,
    });
}
