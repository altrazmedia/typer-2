// @vitest-environment node

import { beforeAll, describe, expect, it } from "vitest";

import { handleMcpRequest } from "@/features/mcp/api/mcp";
import { signAccessToken } from "@/features/oauth/server/jwt";
import { makeUser } from "@/test/factories";
import { prisma } from "@/test/prisma";

beforeAll(() => {
    process.env.AUTH_SECRET =
        "test-secret-for-mcp-tests-at-least-32-chars-long!";
});

function mcpRequest(body: unknown, authHeader?: string) {
    return new Request("http://test.local/api/mcp", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/event-stream",
            ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify(body),
    });
}

describe("handleMcpRequest — authentication", () => {
    it("returns 401 with WWW-Authenticate when no Authorization header", async () => {
        const req = mcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(401);
        const wwwAuth = res.headers.get("www-authenticate") ?? "";
        expect(wwwAuth).toContain("Bearer");
        expect(wwwAuth).toContain("/.well-known/oauth-protected-resource");
    });

    it("returns 401 when Authorization header has no Bearer prefix", async () => {
        const req = mcpRequest(
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            "Basic dXNlcjpwYXNz",
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(401);
    });

    it("returns 401 for an invalid JWT", async () => {
        const req = mcpRequest(
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            "Bearer not.a.valid.jwt",
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(401);
        const wwwAuth = res.headers.get("www-authenticate") ?? "";
        expect(wwwAuth).toContain("Bearer");
    });
});

describe("handleMcpRequest — tools/list", () => {
    it("returns tool list for authenticated request", async () => {
        const token = await signAccessToken("user_test_1");
        const req = mcpRequest(
            { jsonrpc: "2.0", id: 1, method: "tools/list" },
            `Bearer ${token}`,
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(200);
        const body = (await res.json()) as Record<string, unknown>;
        const result = body.result as { tools: { name: string }[] };
        expect(result.tools).toEqual(
            expect.arrayContaining([
                expect.objectContaining({ name: "whoami" }),
            ]),
        );
    });
});

describe("handleMcpRequest — whoami tool", () => {
    it("returns user info for a valid token", async () => {
        const token = await signAccessToken("user_test_1");
        prisma.user.findUnique.mockResolvedValue(
            makeUser({
                id: "user_test_1",
                name: "Jan Kowalski",
                email: "jan@test.dev",
            }),
        );

        const req = mcpRequest(
            {
                jsonrpc: "2.0",
                id: 2,
                method: "tools/call",
                params: { name: "whoami", arguments: {} },
            },
            `Bearer ${token}`,
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(200);

        const body = (await res.json()) as Record<string, unknown>;
        const result = body.result as {
            content: { type: string; text: string }[];
        };
        expect(result.content).toHaveLength(1);
        expect(result.content[0].type).toBe("text");

        const parsed = JSON.parse(result.content[0].text) as Record<
            string,
            unknown
        >;
        expect(parsed.id).toBe("user_test_1");
        expect(parsed.name).toBe("Jan Kowalski");
        expect(parsed.email).toBe("jan@test.dev");
    });

    it("returns error content when user not found in db", async () => {
        const token = await signAccessToken("ghost_user");
        prisma.user.findUnique.mockResolvedValue(null);

        const req = mcpRequest(
            {
                jsonrpc: "2.0",
                id: 3,
                method: "tools/call",
                params: { name: "whoami", arguments: {} },
            },
            `Bearer ${token}`,
        );
        const res = await handleMcpRequest(req);
        expect(res.status).toBe(200);

        const body = (await res.json()) as Record<string, unknown>;
        const result = body.result as {
            isError?: boolean;
            content: { type: string; text: string }[];
        };
        expect(result.isError).toBe(true);
    });
});
