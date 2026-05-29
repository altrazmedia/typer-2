"use client";

import { useSyncExternalStore } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

function getMatchMedia(query: string): MediaQueryList | null {
    if (typeof window.matchMedia !== "function") {
        return null;
    }
    return window.matchMedia(query);
}

function subscribe(query: string, onStoreChange: () => void): () => void {
    const media = getMatchMedia(query);
    if (!media) {
        return () => {};
    }

    media.addEventListener("change", onStoreChange);
    return () => media.removeEventListener("change", onStoreChange);
}

function getSnapshot(query: string): boolean {
    return getMatchMedia(query)?.matches ?? false;
}

export function useIsMobile(query: string = MOBILE_QUERY): boolean {
    return useSyncExternalStore(
        (onStoreChange) => subscribe(query, onStoreChange),
        () => getSnapshot(query),
        () => false,
    );
}
