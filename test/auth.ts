import type { Session } from "next-auth";

import { getAuthMock } from "@/test/auth-mock";

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
