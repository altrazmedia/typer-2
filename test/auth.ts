import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { vi } from "vitest";

export function mockAuthedUser(overrides: {
    id: string;
    email?: string;
    name?: string;
}): void {
    vi.mocked(auth).mockResolvedValue({
        user: {
            id: overrides.id,
            email: overrides.email ?? "u@test.dev",
            name: overrides.name ?? "Test User",
        },
    } as Session);
}

export function mockUnauthed(): void {
    vi.mocked(auth).mockResolvedValue(null);
}
