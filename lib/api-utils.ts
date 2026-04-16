import type { GroupMember } from "@prisma/client";
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
