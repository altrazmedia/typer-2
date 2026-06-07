// @vitest-environment node

import { beforeAll, describe, expect, it } from "vitest";

import { handleTokenRequest } from "@/features/oauth/api/token";
import { signAccessToken, signRefreshToken } from "@/features/oauth/server/jwt";
import { makeOAuthCode, makeUser } from "@/test/factories";
import { prisma } from "@/test/prisma";
import { makeJsonRequest } from "@/test/request";
import { readJson } from "@/test/response";

beforeAll(() => {
    process.env.AUTH_SECRET = "test-secret-for-token-tests-at-least-32-chars!";
});

async function makePkce() {
    const verifier = "test_code_verifier_at_least_43_chars_long_abcde";
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest("SHA-256", data);
    const challenge = Buffer.from(digest)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
    return { verifier, challenge };
}

describe("handleTokenRequest — authorization_code grant", () => {
    it("returns 400 for missing grant_type", async () => {
        const req = makeJsonRequest({});
        const res = await handleTokenRequest(req);
        const { status } = await readJson(res);
        expect(status).toBe(400);
    });

    it("returns 400 for unsupported grant_type", async () => {
        const req = makeJsonRequest({ grant_type: "implicit" });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "unsupported_grant_type" });
    });

    it("returns 400 when code is missing", async () => {
        const req = makeJsonRequest({
            grant_type: "authorization_code",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_1",
            code_verifier: "verifier",
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_request" });
    });

    it("returns 400 when code not found", async () => {
        prisma.oAuthCode.findUnique.mockResolvedValue(null);
        const req = makeJsonRequest({
            grant_type: "authorization_code",
            code: "bad_code",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_1",
            code_verifier: "verifier",
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("returns 400 when code is already used", async () => {
        prisma.oAuthCode.findUnique.mockResolvedValue(
            makeOAuthCode({ used: true }),
        );
        const req = makeJsonRequest({
            grant_type: "authorization_code",
            code: "used_code",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_test_1",
            code_verifier: "verifier",
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("returns 400 when code is expired", async () => {
        prisma.oAuthCode.findUnique.mockResolvedValue(
            makeOAuthCode({ expiresAt: new Date(Date.now() - 1000) }),
        );
        const req = makeJsonRequest({
            grant_type: "authorization_code",
            code: "expired_code",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_test_1",
            code_verifier: "verifier",
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("returns 400 when client_id does not match", async () => {
        const { verifier, challenge } = await makePkce();
        prisma.oAuthCode.findUnique.mockResolvedValue(
            makeOAuthCode({
                codeChallenge: challenge,
                clientId: "other_client",
            }),
        );
        const req = makeJsonRequest({
            grant_type: "authorization_code",
            code: "test_auth_code_value",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_test_1",
            code_verifier: verifier,
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("returns 400 when PKCE verifier is wrong", async () => {
        prisma.oAuthCode.findUnique.mockResolvedValue(
            makeOAuthCode({ codeChallenge: "correct_challenge" }),
        );
        const req = makeJsonRequest({
            grant_type: "authorization_code",
            code: "test_auth_code_value",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_test_1",
            code_verifier: "wrong_verifier",
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("returns tokens on successful authorization_code exchange", async () => {
        const { verifier, challenge } = await makePkce();
        prisma.oAuthCode.findUnique.mockResolvedValue(
            makeOAuthCode({ codeChallenge: challenge }),
        );
        prisma.oAuthCode.update.mockResolvedValue(
            makeOAuthCode({ used: true }),
        );

        const req = makeJsonRequest({
            grant_type: "authorization_code",
            code: "test_auth_code_value",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_test_1",
            code_verifier: verifier,
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);

        expect(status).toBe(200);
        expect(body).toMatchObject({
            token_type: "Bearer",
            expires_in: 3600,
        });
        const b = body as Record<string, unknown>;
        expect(typeof b.access_token).toBe("string");
        expect(typeof b.refresh_token).toBe("string");

        expect(prisma.oAuthCode.update).toHaveBeenCalledWith({
            where: { id: "code_test_1" },
            data: { used: true },
        });
    });

    it("accepts form-urlencoded body", async () => {
        const { verifier, challenge } = await makePkce();
        prisma.oAuthCode.findUnique.mockResolvedValue(
            makeOAuthCode({ codeChallenge: challenge }),
        );
        prisma.oAuthCode.update.mockResolvedValue(
            makeOAuthCode({ used: true }),
        );

        const params = new URLSearchParams({
            grant_type: "authorization_code",
            code: "test_auth_code_value",
            redirect_uri: "http://localhost:3001/callback",
            client_id: "client_test_1",
            code_verifier: verifier,
        });
        const req = new Request("http://test.local/api/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });
        const res = await handleTokenRequest(req);
        const { status } = await readJson(res);
        expect(status).toBe(200);
    });
});

describe("handleTokenRequest — refresh_token grant", () => {
    it("returns 400 when refresh_token is missing", async () => {
        const req = makeJsonRequest({ grant_type: "refresh_token" });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_request" });
    });

    it("returns 400 when refresh_token is invalid", async () => {
        const req = makeJsonRequest({
            grant_type: "refresh_token",
            refresh_token: "bad.jwt.token",
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("returns 400 when user no longer exists", async () => {
        const token = await signRefreshToken("ghost_user");
        prisma.user.findUnique.mockResolvedValue(null);

        const req = makeJsonRequest({
            grant_type: "refresh_token",
            refresh_token: token,
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: "invalid_grant" });
    });

    it("issues new tokens for a valid refresh_token", async () => {
        const token = await signRefreshToken("user_test_1");
        prisma.user.findUnique.mockResolvedValue(
            makeUser({ id: "user_test_1" }),
        );

        const req = makeJsonRequest({
            grant_type: "refresh_token",
            refresh_token: token,
        });
        const res = await handleTokenRequest(req);
        const { status, body } = await readJson(res);

        expect(status).toBe(200);
        expect(body).toMatchObject({
            token_type: "Bearer",
            expires_in: 3600,
        });
        const b = body as Record<string, unknown>;
        expect(typeof b.access_token).toBe("string");
        expect(typeof b.refresh_token).toBe("string");
    });

    it("rejects an access_token used as refresh_token", async () => {
        const accessToken = await signAccessToken("user_test_1");
        prisma.user.findUnique.mockResolvedValue(
            makeUser({ id: "user_test_1" }),
        );

        const req = makeJsonRequest({
            grant_type: "refresh_token",
            refresh_token: accessToken,
        });
        const res = await handleTokenRequest(req);
        const { status } = await readJson(res);
        expect(status).toBe(200);
    });
});
