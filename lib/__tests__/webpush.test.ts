import { beforeEach, describe, expect, it, vi } from "vitest";

const { setVapidDetailsMock, sendNotificationMock } = vi.hoisted(() => ({
    setVapidDetailsMock: vi.fn(),
    sendNotificationMock: vi.fn(),
}));

vi.mock("web-push", () => ({
    default: {
        setVapidDetails: setVapidDetailsMock,
        sendNotification: sendNotificationMock,
    },
}));

describe("sendPushNotification", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("configures VAPID once and sends payload", async () => {
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY = "public-key";
        process.env.VAPID_PRIVATE_KEY = "private-key";
        process.env.VAPID_SUBJECT = "mailto:test@example.com";
        sendNotificationMock.mockResolvedValue(undefined);

        const { sendPushNotification } = await import("@/lib/webpush");

        await sendPushNotification(
            {
                endpoint: "https://push.example/subscription-1",
                p256dh: "p256dh",
                auth: "auth",
            },
            {
                title: "Czas na typowanie!",
                body: "Brakuje Twoich typów na dzisiejsze gierki",
                url: "/tournaments",
            },
        );

        expect(setVapidDetailsMock).toHaveBeenCalledWith(
            "mailto:test@example.com",
            "public-key",
            "private-key",
        );
        expect(sendNotificationMock).toHaveBeenCalledWith(
            {
                endpoint: "https://push.example/subscription-1",
                keys: {
                    p256dh: "p256dh",
                    auth: "auth",
                },
            },
            JSON.stringify({
                title: "Czas na typowanie!",
                body: "Brakuje Twoich typów na dzisiejsze gierki",
                url: "/tournaments",
            }),
        );
    });
});

describe("isStalePushSubscriptionError", () => {
    it("detects 410 status codes", async () => {
        const { isStalePushSubscriptionError } = await import("@/lib/webpush");

        expect(isStalePushSubscriptionError({ statusCode: 410 })).toBe(true);
        expect(isStalePushSubscriptionError({ statusCode: 404 })).toBe(false);
        expect(isStalePushSubscriptionError(null)).toBe(false);
    });
});
