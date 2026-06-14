import { describe, expect, it, vi } from "vitest";

import { getAuthInApp } from "@/lib/auth/get-auth-in-app";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";

describe("getAuthInApp", () => {
    it("redirects to login when the user is not authenticated", async () => {
        const { redirect } = await import("next/navigation");
        mockUnauthed();
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("redirect");
        });

        await expect(getAuthInApp()).rejects.toThrow("redirect");
        expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("redirects to login when session has no user id", async () => {
        const { redirect } = await import("next/navigation");
        const { getAuthMock } = await import("@/test/auth-mock");
        getAuthMock().mockResolvedValue({
            // @ts-expect-error - just for testing
            user: { email: "u@test.dev", name: "Test User" },
            expires: new Date(Date.now() + 86_400_000).toISOString(),
        });
        vi.mocked(redirect).mockImplementation(() => {
            throw new Error("redirect");
        });

        await expect(getAuthInApp()).rejects.toThrow("redirect");
        expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("returns the authenticated session", async () => {
        mockAuthedUser({
            id: "user_1",
            email: "user@test.dev",
            name: "Test User",
        });

        const session = await getAuthInApp();

        expect(session.user.id).toBe("user_1");
        expect(session.user.email).toBe("user@test.dev");
        expect(session.user.name).toBe("Test User");
    });
});
