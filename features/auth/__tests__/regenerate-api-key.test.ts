import { describe, expect, it } from "vitest";

import { regenerateApiKey } from "@/features/auth/api/regenerate-api-key";
import { hashApiKey } from "@/lib/api-key";
import { mockApiKeyAuth, mockAuthedUser, mockUnauthed } from "@/test/auth";
import { prisma } from "@/test/prisma";
import { readJson } from "@/test/response";

describe("regenerateApiKey", () => {
    it("returns 401 without session cookie", async () => {
        mockUnauthed();

        const response = await regenerateApiKey();
        const { status, body } = await readJson(response);

        expect(status).toBe(401);
        expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
    });

    it("returns 401 when only API key is provided", async () => {
        mockApiKeyAuth({ id: "u_api" });

        const response = await regenerateApiKey();
        const { status } = await readJson(response);

        expect(status).toBe(401);
    });

    it("returns a new API key and upserts the database row", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.apiKey.upsert.mockResolvedValue({
            id: "key1",
            userId: "u1",
            keyHash: "hash",
            createdAt: new Date(),
            lastUsedAt: null,
        });

        const response = await regenerateApiKey();
        const { status, body } = await readJson(response);

        expect(status).toBe(200);
        expect(body).toEqual(
            expect.objectContaining({
                apiKey: expect.stringMatching(/^typ_/),
            }),
        );

        const apiKey = (body as { apiKey: string }).apiKey;
        expect(prisma.apiKey.upsert).toHaveBeenCalledWith({
            where: { userId: "u1" },
            create: {
                userId: "u1",
                keyHash: hashApiKey(apiKey),
            },
            update: {
                keyHash: hashApiKey(apiKey),
                lastUsedAt: null,
            },
        });
    });
});
