import { createHash, randomBytes } from "crypto";

import { prisma } from "@/lib/db";

const API_KEY_PREFIX = "typ_";

export function hashApiKey(rawKey: string): string {
    return createHash("sha256").update(rawKey).digest("hex");
}

export function generateApiKey(): { rawKey: string; keyHash: string } {
    const rawKey = `${API_KEY_PREFIX}${randomBytes(32).toString("base64url")}`;
    return { rawKey, keyHash: hashApiKey(rawKey) };
}

export async function findUserByApiKey(rawKey: string) {
    const keyHash = hashApiKey(rawKey);
    const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { user: true },
    });
    return apiKey?.user ?? null;
}

export async function touchApiKeyLastUsed(rawKey: string): Promise<void> {
    const keyHash = hashApiKey(rawKey);
    await prisma.apiKey.updateMany({
        where: { keyHash },
        data: { lastUsedAt: new Date() },
    });
}
