import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { Session } from "next-auth";
import { afterEach, vi } from "vitest";
import { mockReset } from "vitest-mock-extended";

import { getAuthMock } from "@/test/auth-mock";

import { prisma } from "./prisma";
import { mockRouter } from "./router";

vi.mock("@/lib/db", () => import("./prisma"));

vi.mock("@/lib/auth", () => ({
    auth: vi.fn<() => Promise<Session | null>>().mockResolvedValue(null),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => mockRouter,
    useSearchParams: () => new URLSearchParams(),
    usePathname: () => "/",
    notFound: vi.fn(),
    redirect: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
    signIn: vi.fn(),
}));

if (typeof window !== "undefined") {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
}

afterEach(() => {
    mockReset(prisma);
    vi.clearAllMocks();
    getAuthMock().mockResolvedValue(null);
    if (typeof window !== "undefined") {
        cleanup();
    }
});
