import webpush from "web-push";

export type PushNotificationPayload = {
    title: string;
    body: string;
    url?: string;
};

export type PushSubscriptionRecord = {
    endpoint: string;
    p256dh: string;
    auth: string;
};

let vapidConfigured = false;

function ensureVapidConfigured(): void {
    if (vapidConfigured) {
        return;
    }

    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT;

    if (!publicKey || !privateKey || !subject) {
        throw new Error("Brak konfiguracji VAPID.");
    }

    webpush.setVapidDetails(subject, publicKey, privateKey);
    vapidConfigured = true;
}

export async function sendPushNotification(
    subscription: PushSubscriptionRecord,
    payload: PushNotificationPayload,
): Promise<void> {
    ensureVapidConfigured();

    await webpush.sendNotification(
        {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
            },
        },
        JSON.stringify(payload),
    );
}

export function isStalePushSubscriptionError(error: unknown): boolean {
    return (
        typeof error === "object" &&
        error !== null &&
        "statusCode" in error &&
        (error as { statusCode?: number }).statusCode === 410
    );
}
