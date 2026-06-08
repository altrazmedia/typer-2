"use client";

import { DownloadIcon } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

import type { BeforeInstallPromptEvent } from "@/features/pwa/types";

function isIosDevice(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }

    return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export const InstallPwaButton: React.FC = () => {
    const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
    const [canInstall, setCanInstall] = useState(false);
    const isIos = useSyncExternalStore(
        () => () => {},
        () => isIosDevice(),
        () => false,
    );

    useEffect(() => {
        function handleBeforeInstallPrompt(event: Event) {
            event.preventDefault();
            deferredPromptRef.current = event as BeforeInstallPromptEvent;
            setCanInstall(true);
        }

        function handleAppInstalled() {
            deferredPromptRef.current = null;
            setCanInstall(false);
        }

        window.addEventListener(
            "beforeinstallprompt",
            handleBeforeInstallPrompt,
        );
        window.addEventListener("appinstalled", handleAppInstalled);

        return () => {
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt,
            );
            window.removeEventListener("appinstalled", handleAppInstalled);
        };
    }, []);

    async function handleInstall() {
        const deferredPrompt = deferredPromptRef.current;
        if (!deferredPrompt) {
            return;
        }

        await deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPromptRef.current = null;
        setCanInstall(false);
    }

    if (isIos) {
        return (
            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <DownloadIcon className="size-5" />
                    <h2 className="font-heading text-lg font-semibold">
                        Zainstaluj aplikację
                    </h2>
                </div>
                <p className="text-sm text-muted-foreground">
                    Stuknij Udostępnij, a następnie Dodaj do ekranu głównego.
                </p>
            </section>
        );
    }

    if (!canInstall) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <DownloadIcon className="size-5" />
                <h2 className="font-heading text-lg font-semibold">
                    Zainstaluj aplikację
                </h2>
            </div>
            <p className="text-sm text-muted-foreground">
                Zainstaluj Typer na swoim urządzeniu, aby korzystać z niego jak
                z natywnej aplikacji.
            </p>
            <Button onClick={handleInstall}>Zainstaluj aplikację</Button>
        </section>
    );
};
