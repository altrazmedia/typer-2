import "server-only";

import { NextResponse } from "next/server";

import { parsePlaceBetBody } from "@/features/bet/schema";
import { requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export async function placeBet(request: Request) {
    const authResult = await requireAuth();
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

    const game = await prisma.game.findUnique({ where: { id: parsed.gameId } });
    if (!game) {
        return NextResponse.json(
            { error: "Mecz nie został znaleziony." },
            { status: 404 },
        );
    }

    const now = new Date();
    if (game.kickoffAt <= now) {
        return NextResponse.json(
            { error: "Nie można obstawiać meczu po rozpoczęciu." },
            { status: 400 },
        );
    }

    await prisma.bet.upsert({
        where: {
            gameId_userId: { gameId: parsed.gameId, userId: session.user.id },
        },
        create: {
            gameId: parsed.gameId,
            userId: session.user.id,
            homeScore: parsed.homeScore,
            awayScore: parsed.awayScore,
        },
        update: {
            homeScore: parsed.homeScore,
            awayScore: parsed.awayScore,
        },
    });

    return NextResponse.json({
        homeScore: parsed.homeScore,
        awayScore: parsed.awayScore,
    });
}
