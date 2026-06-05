import "server-only";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

import { getTournamentLeaderboard } from "@/features/tournament/server/get-tournament-leaderboard";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function getLeaderboard(request: Request, context: RouteContext) {
    const authResult = await requireAuth(request);
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;

    const { id: tournamentId } = await context.params;

    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
        select: { groupId: true },
    });

    if (!tournament) {
        return NextResponse.json(
            { error: "Turniej nie został znaleziony." },
            { status: 404 },
        );
    }

    const membership = await prisma.groupMember.findFirst({
        where: {
            groupId: tournament.groupId,
            userId: session.user.id,
        },
    });

    if (!membership) {
        return NextResponse.json(
            { error: "Brak dostępu do tej grupy." },
            { status: 403 },
        );
    }

    const leaderboard = await getTournamentLeaderboard(tournamentId);

    if (!leaderboard) {
        return NextResponse.json(
            { error: "Turniej nie został znaleziony." },
            { status: 404 },
        );
    }

    return NextResponse.json(leaderboard);
}
