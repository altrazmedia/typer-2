import type { Session } from "next-auth";

import { hashApiKey } from "@/lib/api-key";
import { getAuthMock } from "@/test/auth-mock";
import { makeUser } from "@/test/factories";
import { prisma } from "@/test/prisma";

export function mockAuthedUser(overrides: {
    id: string;
    email?: string;
    name?: string;
}): void {
    const session: Session = {
        user: {
            id: overrides.id,
            email: overrides.email ?? "u@test.dev",
            name: overrides.name ?? "Test User",
        },
        expires: new Date(Date.now() + 86_400_000).toISOString(),
    };
    getAuthMock().mockResolvedValue(session);
}

export function mockUnauthed(): void {
    getAuthMock().mockResolvedValue(null);
}

export function mockApiKeyAuth(
    overrides: {
        id: string;
        email?: string;
        name?: string;
        rawKey?: string;
    },
    options: { clearSession?: boolean } = {},
): string {
    if (options.clearSession !== false) {
        mockUnauthed();
    }
    const rawKey = overrides.rawKey ?? "typ_test_key_value_for_testing_only";
    const keyHash = hashApiKey(rawKey);
    const user = makeUser({
        id: overrides.id,
        email: overrides.email ?? "u@test.dev",
        name: overrides.name ?? "Test User",
    });

    prisma.apiKey.findUnique.mockResolvedValue({
        id: "api_key_test_1",
        userId: user.id,
        keyHash,
        createdAt: new Date(),
        lastUsedAt: null,
        user,
    } as never);
    prisma.apiKey.updateMany.mockResolvedValue({ count: 1 });

    return rawKey;
}
