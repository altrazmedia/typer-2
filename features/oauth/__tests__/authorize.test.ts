import { describe, expect, it } from "vitest";

import { handleAuthorizeSubmit } from "@/features/oauth/api/authorize";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeOAuthClient, makeOAuthCode } from "@/test/factories";
import { prisma } from "@/test/prisma";

function makeFormRequest(fields: Record<string, string>) {
    const form = new URLSearchParams(fields).toString();
    return new Request("http://test.local/api/oauth/authorize", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
    });
}

const baseFields = {
    action: "approve",
    client_id: "client_test_1",
    redirect_uri: "http://localhost:3001/callback",
    code_challenge: "challenge_abc",
    code_challenge_method: "S256",
};

describe("handleAuthorizeSubmit", () => {
    it("returns 401 when unauthenticated", async () => {
        mockUnauthed();
        const req = makeFormRequest(baseFields);
        const res = await handleAuthorizeSubmit(req);
        expect(res.status).toBe(401);
    });

    it("returns 400 when client_id is missing", async () => {
        mockAuthedUser({ id: "u1" });
        const req = makeFormRequest({
            action: "approve",
            redirect_uri: "http://localhost:3001/callback",
            code_challenge: "ch",
            code_challenge_method: "S256",
        });
        const res = await handleAuthorizeSubmit(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 when client not found", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.oAuthClient.findUnique.mockResolvedValue(null);
        const req = makeFormRequest(baseFields);
        const res = await handleAuthorizeSubmit(req);
        expect(res.status).toBe(400);
    });

    it("returns 400 when redirect_uri not in client list", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.oAuthClient.findUnique.mockResolvedValue(
            makeOAuthClient({
                id: "client_test_1",
                redirectUris: ["http://other.com/callback"],
            }),
        );
        const req = makeFormRequest(baseFields);
        const res = await handleAuthorizeSubmit(req);
        expect(res.status).toBe(400);
    });

    it("redirects with error=access_denied when action is deny", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.oAuthClient.findUnique.mockResolvedValue(
            makeOAuthClient({ id: "client_test_1" }),
        );
        const req = makeFormRequest({
            ...baseFields,
            action: "deny",
            state: "st1",
        });
        const res = await handleAuthorizeSubmit(req);
        expect(res.status).toBe(302);
        const location = res.headers.get("location") ?? "";
        expect(location).toContain("error=access_denied");
        expect(location).toContain("state=st1");
    });

    it("creates code and redirects with code when action is approve", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.oAuthClient.findUnique.mockResolvedValue(
            makeOAuthClient({ id: "client_test_1" }),
        );
        const oauthCode = makeOAuthCode({ code: "generated_code_abc" });
        prisma.oAuthCode.create.mockResolvedValue(oauthCode);

        const req = makeFormRequest({ ...baseFields, state: "xyz" });
        const res = await handleAuthorizeSubmit(req);

        expect(res.status).toBe(302);
        const location = res.headers.get("location") ?? "";
        expect(location).toContain("code=generated_code_abc");
        expect(location).toContain("state=xyz");

        expect(prisma.oAuthCode.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                clientId: "client_test_1",
                userId: "u1",
                redirectUri: "http://localhost:3001/callback",
                codeChallenge: "challenge_abc",
                codeChallengeMethod: "S256",
            }),
        });
    });
});
