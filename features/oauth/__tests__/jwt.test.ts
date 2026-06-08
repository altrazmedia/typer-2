// @vitest-environment node

import { beforeAll, describe, expect, it } from "vitest";

import {
    signAccessToken,
    signRefreshToken,
    verifyToken,
} from "@/features/oauth/server/jwt";

beforeAll(() => {
    process.env.AUTH_SECRET =
        "test-secret-for-jwt-tests-at-least-32-chars-long";
});

describe("signAccessToken / verifyToken", () => {
    it("signs a token and verifies it successfully", async () => {
        const token = await signAccessToken("user_123");
        const payload = await verifyToken(token);
        expect(payload).not.toBeNull();
        expect(payload?.sub).toBe("user_123");
    });

    it("returns null for a tampered token", async () => {
        const token = await signAccessToken("user_abc");
        const tampered = token.slice(0, -5) + "XXXXX";
        const payload = await verifyToken(tampered);
        expect(payload).toBeNull();
    });

    it("returns null for a completely invalid string", async () => {
        const payload = await verifyToken("not.a.jwt");
        expect(payload).toBeNull();
    });

    it("returns null for an empty string", async () => {
        const payload = await verifyToken("");
        expect(payload).toBeNull();
    });
});

describe("signRefreshToken / verifyToken", () => {
    it("signs a refresh token and verifies it successfully", async () => {
        const token = await signRefreshToken("user_456");
        const payload = await verifyToken(token);
        expect(payload).not.toBeNull();
        expect(payload?.sub).toBe("user_456");
    });
});
