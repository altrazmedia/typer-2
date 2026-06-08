import { describe, expect, it } from "vitest";

import { subscribePush, unsubscribePush } from "@/features/pwa/api/subscribe";
import { mockAuthedUser, mockUnauthed } from "@/test/auth";
import { makeJsonRequest } from "@/test/request";
import { prisma } from "@/test/prisma";
import { readJson } from "@/test/response";

const subscriptionBody = {
    endpoint: "https://push.example/subscription-1",
    keys: {
        p256dh: "test_p256dh_key",
        auth: "test_auth_key",
    },
};

describe("subscribePush", () => {
    it("returns 401 without session cookie", async () => {
        mockUnauthed();

        const response = await subscribePush(makeJsonRequest(subscriptionBody));
        const { status, body } = await readJson(response);

        expect(status).toBe(401);
        expect(body).toEqual({ error: "Wymagane uwierzytelnienie." });
    });

    it("returns 400 for invalid body", async () => {
        mockAuthedUser({ id: "u1" });

        const response = await subscribePush(makeJsonRequest({ endpoint: "" }));
        const { status, body } = await readJson(response);

        expect(status).toBe(400);
        expect(body).toEqual({ error: "Nieprawidłowe dane wejściowe." });
    });

    it("upserts a push subscription for the authenticated user", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.pushSubscription.upsert.mockResolvedValue({
            id: "push1",
            userId: "u1",
            endpoint: subscriptionBody.endpoint,
            p256dh: subscriptionBody.keys.p256dh,
            auth: subscriptionBody.keys.auth,
            createdAt: new Date(),
        });

        const response = await subscribePush(makeJsonRequest(subscriptionBody));
        const { status, body } = await readJson(response);

        expect(status).toBe(200);
        expect(body).toEqual({ ok: true });
        expect(prisma.pushSubscription.upsert).toHaveBeenCalledWith({
            where: { endpoint: subscriptionBody.endpoint },
            create: {
                userId: "u1",
                endpoint: subscriptionBody.endpoint,
                p256dh: subscriptionBody.keys.p256dh,
                auth: subscriptionBody.keys.auth,
            },
            update: {
                userId: "u1",
                p256dh: subscriptionBody.keys.p256dh,
                auth: subscriptionBody.keys.auth,
            },
        });
    });
});

describe("unsubscribePush", () => {
    it("returns 401 without session cookie", async () => {
        mockUnauthed();

        const response = await unsubscribePush(
            makeJsonRequest(subscriptionBody, { method: "DELETE" }),
        );
        const { status } = await readJson(response);

        expect(status).toBe(401);
    });

    it("deletes the subscription for the authenticated user", async () => {
        mockAuthedUser({ id: "u1" });
        prisma.pushSubscription.deleteMany.mockResolvedValue({ count: 1 });

        const response = await unsubscribePush(
            makeJsonRequest(subscriptionBody, { method: "DELETE" }),
        );
        const { status, body } = await readJson(response);

        expect(status).toBe(200);
        expect(body).toEqual({ ok: true });
        expect(prisma.pushSubscription.deleteMany).toHaveBeenCalledWith({
            where: {
                endpoint: subscriptionBody.endpoint,
                userId: "u1",
            },
        });
    });
});
