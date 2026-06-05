import "server-only";

import { NextResponse } from "next/server";

import { generateApiKey } from "@/lib/api-key";
import { requireSessionAuth } from "@/lib/api-utils";
import { prisma } from "@/lib/db";

export async function regenerateApiKey() {
    const authResult = await requireSessionAuth();
    if (!authResult.ok) {
        return authResult.response;
    }
    const { session } = authResult;
    const userId = session.user.id;

    const { rawKey, keyHash } = generateApiKey();

    await prisma.apiKey.upsert({
        where: { userId },
        create: { userId, keyHash },
        update: { keyHash, lastUsedAt: null },
    });

    return NextResponse.json({ apiKey: rawKey });
}
