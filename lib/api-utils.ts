import type { GroupMember, Tournament } from "@prisma/client";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type AuthSuccess = { ok: true; session: Session };
export type AuthFailure = { ok: false; response: NextResponse };
export type RequireAuthResult = AuthSuccess | AuthFailure;

/**
 * Ensures the request has a valid session. Returns 401 JSON if not authenticated.
 */
export async function requireAuth(): Promise<RequireAuthResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return {
            ok: false,
            response: NextResponse.json(
                { error: "Wymagane uwierzytelnienie." },
                { status: 401 },
            ),
        };
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
