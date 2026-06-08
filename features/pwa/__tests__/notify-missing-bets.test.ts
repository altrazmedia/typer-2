import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { notifyMissingBets } from "@/features/pwa/api/notify-missing-bets";
import { makePushSubscription } from "@/test/factories";
import { prisma } from "@/test/prisma";
import { readJson } from "@/test/response";

const { sendPushNotificationMock, isStalePushSubscriptionErrorMock } =
    vi.hoisted(() => ({
        sendPushNotificationMock: vi.fn(),
        isStalePushSubscriptionErrorMock: vi.fn(),
    }));

vi.mock("@/lib/webpush", () => ({
    sendPushNotification: sendPushNotificationMock,
    isStalePushSubscriptionError: isStalePushSubscriptionErrorMock,
}));

function makeCronRequest(secret = "cron-secret"): Request {
    return new Request("http://test.local/api/cron/notify-missing-bets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secret}`,
        },
    });
}

describe("notifyMissingBets", () => {
    beforeEach(() => {
        process.env.CRON_SECRET = "cron-secret";
        isStalePushSubscriptionErrorMock.mockReturnValue(false);
    });

    afterEach(() => {
        delete process.env.CRON_SECRET;
    });

    it("returns 401 when cron secret is invalid", async () => {
        const response = await notifyMissingBets(
            makeCronRequest("wrong-secret"),
        );
        const { status, body } = await readJson(response);

        expect(status).toBe(401);
        expect(body).toEqual({ error: "Brak autoryzacji." });
    });

    it("returns zero counts when no games need bets", async () => {
        prisma.game.findMany.mockResolvedValue([]);

        const response = await notifyMissingBets(makeCronRequest());
        const { status, body } = await readJson(response);

        expect(status).toBe(200);
        expect(body).toEqual({ sent: 0, removed: 0 });
    });

    it("sends one notification per subscribed user with missing bets", async () => {
        prisma.game.findMany.mockResolvedValue([
            {
                bets: [],
                tournament: {
                    group: {
                        members: [{ userId: "u1" }, { userId: "u2" }],
                    },
                },
            },
            {
                bets: [{ userId: "u1" }],
                tournament: {
                    group: {
                        members: [{ userId: "u1" }, { userId: "u2" }],
                    },
                },
            },
        ] as never);

        prisma.pushSubscription.findMany.mockResolvedValue([
            makePushSubscription({ userId: "u1", id: "sub1" }),
            makePushSubscription({
                userId: "u2",
                id: "sub2",
                endpoint: "https://push.example/subscription-2",
            }),
        ]);

        sendPushNotificationMock.mockResolvedValue(undefined);

        const response = await notifyMissingBets(makeCronRequest());
        const { status, body } = await readJson(response);

        expect(status).toBe(200);
        expect(body).toEqual({ sent: 2, removed: 0 });
        expect(sendPushNotificationMock).toHaveBeenCalledTimes(2);
        expect(sendPushNotificationMock).toHaveBeenCalledWith(
            expect.objectContaining({
                endpoint: "https://push.example/subscription-1",
            }),
            {
                title: "Czas na typowanie!",
                body: "Brakuje Twoich typów na dzisiejsze gierki",
                url: "/tournaments",
            },
        );
    });

    it("removes stale subscriptions after 410 responses", async () => {
        prisma.game.findMany.mockResolvedValue([
            {
                bets: [],
                tournament: {
                    group: {
                        members: [{ userId: "u1" }],
                    },
                },
            },
        ] as never);

        prisma.pushSubscription.findMany.mockResolvedValue([
            makePushSubscription({ userId: "u1", id: "sub1" }),
        ]);

        const staleError = { statusCode: 410 };
        sendPushNotificationMock.mockRejectedValue(staleError);
        isStalePushSubscriptionErrorMock.mockReturnValue(true);
        prisma.pushSubscription.delete.mockResolvedValue(
            makePushSubscription({ userId: "u1", id: "sub1" }),
        );

        const response = await notifyMissingBets(makeCronRequest());
        const { status, body } = await readJson(response);

        expect(status).toBe(200);
        expect(body).toEqual({ sent: 0, removed: 1 });
        expect(prisma.pushSubscription.delete).toHaveBeenCalledWith({
            where: { id: "sub1" },
        });
    });
});
