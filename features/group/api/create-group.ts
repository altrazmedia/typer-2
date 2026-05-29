import "server-only";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

import { parseGroupNameBody } from "@/features/group/schema";

export async function createGroup(request: Request) {
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

    const parsed = parseGroupNameBody(json);
    if (!parsed) {
        return NextResponse.json(
            { error: "Podaj prawidłową nazwę grupy." },
            { status: 400 },
        );
    }

    const result = await prisma.$transaction(async (tx) => {
        const group = await tx.group.create({
            data: {
                name: parsed.name,
                createdBy: session.user.id,
            },
        });
        const groupMember = await tx.groupMember.create({
            data: {
                groupId: group.id,
                userId: session.user.id,
                isAdmin: true,
            },
        });
        return { group, groupMember };
    });

    return NextResponse.json(
        {
            group: result.group,
            groupMember: result.groupMember,
        },
        { status: 201 },
    );
}
