import type { GroupMember, Tournament } from "@prisma/client";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

import { findUserByApiKey, touchApiKeyLastUsed } from "@/lib/api-key";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AuthSuccess = { ok: true; session: Session };
export type AuthFailure = { ok: false; response: NextResponse };
export type RequireAuthResult = AuthSuccess | AuthFailure;

function unauthenticatedResponse(): NextResponse {
    return NextResponse.json(
        { error: "Wymagane uwierzytelnienie." },
        { status: 401 },
    );
}

function buildSession(user: {
    id: string;
    email: string;
    name: string;
}): Session {
    return {
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
        },
        expires: new Date(Date.now() + 86_400_000).toISOString(),
    };
}

/**
 * Ensures the request has a valid session cookie or API key.
 * Returns 401 JSON if not authenticated.
 */
export async function requireAuth(
    request: Request,
): Promise<RequireAuthResult> {
    const session = await auth();
    if (session?.user?.id) {
        return { ok: true, session };
    }

    const rawKey = request.headers.get("X-API-Key")?.trim();
    if (!rawKey) {
        return { ok: false, response: unauthenticatedResponse() };
    }

    const user = await findUserByApiKey(rawKey);
    if (!user) {
        return { ok: false, response: unauthenticatedResponse() };
    }

    void touchApiKeyLastUsed(rawKey);

    return { ok: true, session: buildSession(user) };
}

/**
 * Ensures the request has a valid session cookie only (ignores X-API-Key).
 */
export async function requireSessionAuth(): Promise<RequireAuthResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { ok: false, response: unauthenticatedResponse() };
    }
    return { ok: true, session };
}

/**
 * Returns the caller's admin membership for a group, or null if not an admin.
 */
export async function requireGroupAdmin(
    groupId: string,
    userId: string,
): Promise<GroupMember | null> {
    return prisma.groupMember.findFirst({
        where: { groupId, userId, isAdmin: true },
    });
}

export type TournamentAdminResult =
    | { ok: true; tournament: Tournament; adminMembership: GroupMember }
    | { ok: false; reason: "not_found" | "forbidden" };

/**
 * Ensures the tournament exists and the user is a group admin for its group.
 */
export async function requireTournamentAdmin(
    tournamentId: string,
    userId: string,
): Promise<TournamentAdminResult> {
    const tournament = await prisma.tournament.findUnique({
        where: { id: tournamentId },
    });
    if (!tournament) {
        return { ok: false, reason: "not_found" };
    }
    const adminMembership = await requireGroupAdmin(tournament.groupId, userId);
    if (!adminMembership) {
        return { ok: false, reason: "forbidden" };
    }
    return { ok: true, tournament, adminMembership };
}
