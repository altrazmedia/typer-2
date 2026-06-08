import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
    interface WorkerGlobalScope extends SerwistGlobalConfig {
        __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
    }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
    precacheEntries: self.__SW_MANIFEST,
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [],
});

serwist.addEventListeners();

self.addEventListener("push", (event) => {
    const pushEvent = event as PushEvent;
    const payload = pushEvent.data?.json() as
        | {
              title?: string;
              body?: string;
              url?: string;
          }
        | undefined;

    const title = payload?.title ?? "Typer";
    const body = payload?.body ?? "";
    const url = payload?.url ?? "/tournaments";

    pushEvent.waitUntil(
        self.registration.showNotification(title, {
            body,
            data: { url },
        }),
    );
});

self.addEventListener("notificationclick", (event) => {
    const notificationEvent = event as NotificationEvent;
    notificationEvent.notification.close();

    const url =
        (notificationEvent.notification.data as { url?: string } | undefined)
            ?.url ?? "/tournaments";

    notificationEvent.waitUntil(
        self.clients
            .matchAll({ type: "window", includeUncontrolled: true })
            .then((clientList) => {
                for (const client of clientList) {
                    if ("focus" in client && client.url.includes(url)) {
                        return client.focus();
                    }
                }

                if (self.clients.openWindow) {
                    return self.clients.openWindow(url);
                }

                return undefined;
            }),
    );
});
