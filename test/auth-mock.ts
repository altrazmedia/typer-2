import type { Session } from "next-auth";
import type { Mock } from "vitest";
import { vi } from "vitest";

import { auth } from "@/lib/auth";

export type AuthMockFn = () => Promise<Session | null>;

export function getAuthMock(): Mock<AuthMockFn> {
    return vi.mocked(auth) as unknown as Mock<AuthMockFn>;
}
