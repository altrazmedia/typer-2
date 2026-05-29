import "server-only";

import { NextResponse } from "next/server";

import { requireAuth, requireGroupAdmin } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

import { parseGroupNameBody } from "@/features/group/schema";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function updateGroup(request: Request, context: RouteContext) {
    const authResult = await requireAuth();
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;

    const { id: groupId } = await context.params;

    const group = await prisma.group.findUnique({
        where: { id: groupId },
    });
    if (!group) {
        return NextResponse.json(
            { error: "Grupa nie została znaleziona." },
            { status: 404 },
        );
    }

    const adminMembership = await requireGroupAdmin(groupId, session.user.id);
    if (!adminMembership) {
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

    const parsed = parseGroupNameBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj prawidłową nazwę grupy." },
            { status: 400 },
        );
    }

    const updated = await prisma.group.update({
        where: { id: groupId },
        data: { name: parsed.name },
    });

    return NextResponse.json({ group: updated });
}
