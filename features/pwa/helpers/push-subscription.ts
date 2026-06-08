function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, "+")
        .replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; i += 1) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

export function getVapidPublicKey(): string | null {
    const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    return key && key.length > 0 ? key : null;
}

export async function getServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
    if (!("serviceWorker" in navigator)) {
        return null;
    }

    try {
        return await navigator.serviceWorker.ready;
    } catch {
        return null;
    }
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        return null;
    }

    return registration.pushManager.getSubscription();
}

export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
    const vapidPublicKey = getVapidPublicKey();
    if (!vapidPublicKey) {
        return null;
    }

    const registration = await getServiceWorkerRegistration();
    if (!registration) {
        return null;
    }

    return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
            vapidPublicKey,
        ) as BufferSource,
    });
}

export async function unsubscribeFromPushNotifications(): Promise<boolean> {
    const subscription = await getExistingPushSubscription();
    if (!subscription) {
        return false;
    }

    return subscription.unsubscribe();
}

export function serializePushSubscription(subscription: PushSubscription) {
    const json = subscription.toJSON();
    const endpoint = json.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;

    if (!endpoint || !p256dh || !auth) {
        return null;
    }

    return {
        endpoint,
        keys: {
            p256dh,
            auth,
        },
    };
}
