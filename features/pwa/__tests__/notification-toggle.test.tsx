import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NotificationToggle } from "@/features/pwa/components/notification-toggle";

const {
    getExistingPushSubscriptionMock,
    subscribeToPushNotificationsMock,
    unsubscribeFromPushNotificationsMock,
    serializePushSubscriptionMock,
} = vi.hoisted(() => ({
    getExistingPushSubscriptionMock: vi.fn(),
    subscribeToPushNotificationsMock: vi.fn(),
    unsubscribeFromPushNotificationsMock: vi.fn(),
    serializePushSubscriptionMock: vi.fn(),
}));

vi.mock("@/features/pwa/helpers/push-subscription", () => ({
    getExistingPushSubscription: getExistingPushSubscriptionMock,
    subscribeToPushNotifications: subscribeToPushNotificationsMock,
    unsubscribeFromPushNotifications: unsubscribeFromPushNotificationsMock,
    serializePushSubscription: serializePushSubscriptionMock,
}));

function mockPushSupport() {
    Object.defineProperty(window, "Notification", {
        configurable: true,
        value: {
            permission: "default",
            requestPermission: vi.fn().mockResolvedValue("granted"),
        },
    });
    Object.defineProperty(window.navigator, "serviceWorker", {
        configurable: true,
        value: {},
    });
    Object.defineProperty(window, "PushManager", {
        configurable: true,
        value: function PushManager() {},
    });
}

describe("NotificationToggle", () => {
    beforeEach(() => {
        mockPushSupport();
        getExistingPushSubscriptionMock.mockResolvedValue(null);
        serializePushSubscriptionMock.mockReturnValue({
            endpoint: "https://push.example/subscription-1",
            keys: {
                p256dh: "test_p256dh_key",
                auth: "test_auth_key",
            },
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("shows iOS install hint when PWA is not installed", () => {
        vi.spyOn(navigator, "userAgent", "get").mockReturnValue(
            "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
        );

        render(<NotificationToggle />);

        expect(screen.getByText("Powiadomienia")).toBeInTheDocument();
        expect(
            screen.getByText(/Aby otrzymywać powiadomienia na iOS/i),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: "Włącz powiadomienia" }),
        ).not.toBeInTheDocument();
    });

    it("enables notifications and saves subscription", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        });
        vi.stubGlobal("fetch", fetchMock);

        const subscription = {
            toJSON: () => ({
                endpoint: "https://push.example/subscription-1",
                keys: {
                    p256dh: "test_p256dh_key",
                    auth: "test_auth_key",
                },
            }),
        } as unknown as PushSubscription;

        subscribeToPushNotificationsMock.mockResolvedValue(subscription);

        render(<NotificationToggle />);

        await user.click(
            await screen.findByRole("button", { name: "Włącz powiadomienia" }),
        );

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("/api/push/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    endpoint: "https://push.example/subscription-1",
                    keys: {
                        p256dh: "test_p256dh_key",
                        auth: "test_auth_key",
                    },
                }),
            });
        });

        expect(
            await screen.findByRole("button", {
                name: "Wyłącz powiadomienia",
            }),
        ).toBeInTheDocument();
    });

    it("disables notifications and removes subscription", async () => {
        const user = userEvent.setup();
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ok: true }),
        });
        vi.stubGlobal("fetch", fetchMock);

        const subscription = {
            toJSON: () => ({
                endpoint: "https://push.example/subscription-1",
                keys: {
                    p256dh: "test_p256dh_key",
                    auth: "test_auth_key",
                },
            }),
        } as unknown as PushSubscription;

        getExistingPushSubscriptionMock.mockResolvedValue(subscription);
        unsubscribeFromPushNotificationsMock.mockResolvedValue(true);

        render(<NotificationToggle />);

        await user.click(
            await screen.findByRole("button", {
                name: "Wyłącz powiadomienia",
            }),
        );

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith("/api/push/subscribe", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    endpoint: "https://push.example/subscription-1",
                    keys: {
                        p256dh: "test_p256dh_key",
                        auth: "test_auth_key",
                    },
                }),
            });
        });

        expect(unsubscribeFromPushNotificationsMock).toHaveBeenCalledOnce();
        expect(
            await screen.findByRole("button", { name: "Włącz powiadomienia" }),
        ).toBeInTheDocument();
    });
});
