import { describe, expect, it } from "vitest";

import { registerOAuthClient } from "@/features/oauth/api/register";
import { makeOAuthClient } from "@/test/factories";
import { prisma } from "@/test/prisma";
import { makeJsonRequest } from "@/test/request";
import { readJson } from "@/test/response";

describe("registerOAuthClient", () => {
    it("returns 400 for invalid JSON", async () => {
        const req = new Request("http://test.local/api/oauth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "invalid-json{",
        });
        const res = await registerOAuthClient(req);
        const { status } = await readJson(res);
        expect(status).toBe(400);
    });

    it("returns 400 when client_name is missing", async () => {
        const req = makeJsonRequest({
            redirect_uris: ["http://localhost:3001/callback"],
        });
        const res = await registerOAuthClient(req);
        const { status, body } = await readJson(res);
        expect(status).toBe(400);
        expect(body).toMatchObject({ error: expect.any(String) });
    });

    it("returns 400 when redirect_uris is empty", async () => {
        const req = makeJsonRequest({
            client_name: "My App",
            redirect_uris: [],
        });
        const res = await registerOAuthClient(req);
        const { status } = await readJson(res);
        expect(status).toBe(400);
    });

    it("returns 400 when redirect_uris is missing", async () => {
        const req = makeJsonRequest({ client_name: "My App" });
        const res = await registerOAuthClient(req);
        const { status } = await readJson(res);
        expect(status).toBe(400);
    });

    it("creates a client and returns client_id on success", async () => {
        const client = makeOAuthClient({
            id: "new_client_id",
            clientName: "Cursor",
            redirectUris: ["cursor://mcp/callback"],
        });
        prisma.oAuthClient.create.mockResolvedValue(client);

        const req = makeJsonRequest({
            client_name: "Cursor",
            redirect_uris: ["cursor://mcp/callback"],
        });
        const res = await registerOAuthClient(req);
        const { status, body } = await readJson(res);

        expect(status).toBe(201);
        expect(body).toMatchObject({
            client_id: "new_client_id",
            client_name: "Cursor",
            redirect_uris: ["cursor://mcp/callback"],
            token_endpoint_auth_method: "none",
            grant_types: ["authorization_code", "refresh_token"],
            response_types: ["code"],
        });

        expect(prisma.oAuthClient.create).toHaveBeenCalledWith({
            data: {
                clientName: "Cursor",
                redirectUris: ["cursor://mcp/callback"],
            },
        });
    });
});
