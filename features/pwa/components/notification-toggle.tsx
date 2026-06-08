"use client";

import { BellIcon } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { showErrorToast } from "@/lib/toast";

import {
    getExistingPushSubscription,
    serializePushSubscription,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
} from "@/features/pwa/helpers/push-subscription";

function isIosDevice(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalonePwa(): boolean {
    if (typeof window === "undefined") {
        return false;
    }

    const navigatorWithStandalone = window.navigator as Navigator & {
        standalone?: boolean;
    };

    return (
        navigatorWithStandalone.standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches
    );
}

function supportsPushNotifications(): boolean {
    return (
        typeof window !== "undefined" &&
        "Notification" in window &&
        "serviceWorker" in navigator &&
        "PushManager" in window
    );
}

export const NotificationToggle: React.FC = () => {
    const [enabled, setEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const isIos = useSyncExternalStore(
        () => () => {},
        () => isIosDevice(),
        () => false,
    );
    const isStandalone = useSyncExternalStore(
        () => () => {},
        () => isStandalonePwa(),
        () => false,
    );

    useEffect(() => {
        let cancelled = false;

        async function loadSubscriptionState() {
            if (!supportsPushNotifications()) {
                if (!cancelled) {
                    setEnabled(false);
                    setIsLoading(false);
                }
                return;
            }

            const subscription = await getExistingPushSubscription();
            if (!cancelled) {
                setEnabled(subscription !== null);
                setIsLoading(false);
            }
        }

        void loadSubscriptionState();

        return () => {
            cancelled = true;
        };
    }, []);

    async function saveSubscription(subscription: PushSubscription) {
        const payload = serializePushSubscription(subscription);
        if (!payload) {
            throw new Error("invalid-subscription");
        }

        const response = await fetch("/api/push/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("save-failed");
        }
    }

    async function removeSubscription(subscription: PushSubscription) {
        const payload = serializePushSubscription(subscription);
        if (!payload) {
            throw new Error("invalid-subscription");
        }

        const response = await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("remove-failed");
        }
    }

    async function handleEnable() {
        setIsUpdating(true);
        try {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") {
                showErrorToast("Brak zgody na powiadomienia.");
                return;
            }

            const subscription = await subscribeToPushNotifications();
            if (!subscription) {
                showErrorToast("Nie udało się włączyć powiadomień.");
                return;
            }

            await saveSubscription(subscription);
            setEnabled(true);
        } catch {
            showErrorToast("Nie udało się włączyć powiadomień.");
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleDisable() {
        setIsUpdating(true);
        try {
            const subscription = await getExistingPushSubscription();
            if (subscription) {
                await removeSubscription(subscription);
                await unsubscribeFromPushNotifications();
            }

            setEnabled(false);
        } catch {
            showErrorToast("Nie udało się wyłączyć powiadomień.");
        } finally {
            setIsUpdating(false);
        }
    }

    async function handleToggle() {
        if (enabled) {
            await handleDisable();
            return;
        }

        await handleEnable();
    }

    if (isIos && !isStandalone) {
        return (
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <BellIcon className="size-5" />
                    <h2 className="font-heading text-lg font-semibold">
                        Powiadomienia
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Aby otrzymywać powiadomienia na iOS, zainstaluj aplikację na
                    ekranie głównym. Stuknij Udostępnij, a następnie Dodaj do
                    ekranu głównego.
                </p>
            </section>
        );
    }

    if (!supportsPushNotifications()) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <BellIcon className="size-5" />
                <h2 className="font-heading text-lg font-semibold">
                    Powiadomienia
                </h2>
            </div>
            <p className="text-sm text-muted-foreground">
                Otrzymuj przypomnienia o brakujących typach na nadchodzące
                mecze.
            </p>
            <Button
                onClick={handleToggle}
                disabled={isLoading || isUpdating}
                variant={enabled ? "secondary" : "default"}
            >
                {isLoading || isUpdating
                    ? "Ładowanie..."
                    : enabled
                      ? "Wyłącz powiadomienia"
                      : "Włącz powiadomienia"}
            </Button>
        </section>
    );
};
