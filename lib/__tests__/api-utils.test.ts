import { describe, expect, it } from "vitest";

import { requireAuth, requireSessionAuth } from "@/lib/api-utils";
import { mockApiKeyAuth, mockAuthedUser, mockUnauthed } from "@/test/auth";
import { prisma } from "@/test/prisma";
import { readJson } from "@/test/response";

describe("requireAuth", () => {
    it("returns session when cookie auth succeeds", async () => {
        mockAuthedUser({ id: "u1", email: "u1@test.dev", name: "User One" });
        const request = new Request("http://test.local/api");

        const result = await requireAuth(request);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.session.user.id).toBe("u1");
            expect(result.session.user.email).toBe("u1@test.dev");
        }
    });

    it("returns 401 when unauthenticated and no API key", async () => {
        mockUnauthed();
        const request = new Request("http://test.local/api");

        const result = await requireAuth(request);

        expect(result.ok).toBe(false);
        if (!result.ok) {
            const { status, body } = await readJson(result.response);
            expect(status).toBe(401);
            expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
        }
    });

    it("returns 401 when API key is invalid", async () => {
        mockUnauthed();
        prisma.apiKey.findUnique.mockResolvedValue(null);
        const request = new Request("http://test.local/api", {
            headers: { "X-API-Key": "typ_invalid" },
        });

        const result = await requireAuth(request);

        expect(result.ok).toBe(false);
        if (!result.ok) {
            const { status } = await readJson(result.response);
            expect(status).toBe(401);
        }
    });

    it("returns synthetic session for valid API key without cookie", async () => {
        const rawKey = mockApiKeyAuth({
            id: "u_api",
            email: "api@test.dev",
            name: "API User",
        });
        const request = new Request("http://test.local/api", {
            headers: { "X-API-Key": rawKey },
        });

        const result = await requireAuth(request);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.session.user.id).toBe("u_api");
            expect(result.session.user.email).toBe("api@test.dev");
        }
        expect(prisma.apiKey.updateMany).toHaveBeenCalled();
    });

    it("prefers cookie session over API key", async () => {
        mockAuthedUser({ id: "cookie_user" });
        const rawKey = mockApiKeyAuth(
            { id: "api_user" },
            { clearSession: false },
        );
        const request = new Request("http://test.local/api", {
            headers: { "X-API-Key": rawKey },
        });

        const result = await requireAuth(request);

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.session.user.id).toBe("cookie_user");
        }
        expect(prisma.apiKey.findUnique).not.toHaveBeenCalled();
    });
});

describe("requireSessionAuth", () => {
    it("returns 401 without cookie even when API key is present", async () => {
        const rawKey = mockApiKeyAuth({ id: "u_api" });
        const request = new Request("http://test.local/api", {
            headers: { "X-API-Key": rawKey },
        });

        const result = await requireSessionAuth();

        expect(result.ok).toBe(false);
        if (!result.ok) {
            const { status } = await readJson(result.response);
            expect(status).toBe(401);
        }
        expect(request.headers.get("X-API-Key")).toBe(rawKey);
    });

    it("returns session when cookie auth succeeds", async () => {
        mockAuthedUser({ id: "u1" });

        const result = await requireSessionAuth();

        expect(result.ok).toBe(true);
        if (result.ok) {
            expect(result.session.user.id).toBe("u1");
        }
    });
});
