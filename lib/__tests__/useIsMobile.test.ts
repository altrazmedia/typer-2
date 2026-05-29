import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useIsMobile } from "@/lib/useIsMobile";

type ChangeListener = () => void;

function createMatchMediaMock(initialMatches: boolean) {
    const listeners = new Set<ChangeListener>();

    const mediaQueryList = {
        matches: initialMatches,
        media: "",
        onchange: null,
        addEventListener: vi.fn((event: string, listener: ChangeListener) => {
            if (event === "change") {
                listeners.add(listener);
            }
        }),
        removeEventListener: vi.fn(
            (event: string, listener: ChangeListener) => {
                if (event === "change") {
                    listeners.delete(listener);
                }
            },
        ),
        dispatchEvent: vi.fn(),
    };

    return {
        mediaQueryList,
        setMatches(matches: boolean) {
            mediaQueryList.matches = matches;
            for (const listener of listeners) {
                listener();
            }
        },
    };
}

describe("useIsMobile", () => {
    const originalMatchMedia = window.matchMedia;

    afterEach(() => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: originalMatchMedia,
        });
    });

    it("returns false when the query does not match", () => {
        const { mediaQueryList } = createMatchMediaMock(false);
        window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
        expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 767px)");
    });

    it("returns true when the query matches", () => {
        const { mediaQueryList } = createMatchMediaMock(true);
        window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(true);
    });

    it("updates when the media query changes", () => {
        const { mediaQueryList, setMatches } = createMatchMediaMock(false);
        window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);

        act(() => {
            setMatches(true);
        });

        expect(result.current).toBe(true);
    });

    it("uses a custom query when provided", () => {
        const { mediaQueryList } = createMatchMediaMock(true);
        window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

        renderHook(() => useIsMobile("(max-width: 480px)"));

        expect(window.matchMedia).toHaveBeenCalledWith("(max-width: 480px)");
    });

    it("returns false when matchMedia is unavailable", () => {
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: undefined,
        });

        const { result } = renderHook(() => useIsMobile());

        expect(result.current).toBe(false);
    });

    it("unsubscribes on unmount", () => {
        const { mediaQueryList } = createMatchMediaMock(false);
        window.matchMedia = vi.fn().mockReturnValue(mediaQueryList);

        const { unmount } = renderHook(() => useIsMobile());
        unmount();

        expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith(
            "change",
            expect.any(Function),
        );
    });
});
