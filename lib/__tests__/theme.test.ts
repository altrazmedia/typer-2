import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    THEME_STORAGE_KEY,
    applyTheme,
    getThemeFromDocument,
    readStoredTheme,
    setTheme,
    toggleTheme,
} from "@/lib/theme";

describe("theme", () => {
    beforeEach(() => {
        document.documentElement.classList.remove("dark");
        localStorage.clear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        document.documentElement.classList.remove("dark");
        localStorage.clear();
    });

    describe("readStoredTheme", () => {
        it("returns light when storage is empty", () => {
            expect(readStoredTheme()).toBe("light");
        });

        it("returns dark when storage contains dark", () => {
            localStorage.setItem(THEME_STORAGE_KEY, "dark");
            expect(readStoredTheme()).toBe("dark");
        });

        it("returns light when storage contains light", () => {
            localStorage.setItem(THEME_STORAGE_KEY, "light");
            expect(readStoredTheme()).toBe("light");
        });

        it("returns light for invalid stored value", () => {
            localStorage.setItem(THEME_STORAGE_KEY, "invalid");
            expect(readStoredTheme()).toBe("light");
        });

        it("returns light when localStorage throws", () => {
            vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
                throw new Error("blocked");
            });

            expect(readStoredTheme()).toBe("light");
        });
    });

    describe("applyTheme", () => {
        it("adds dark class on html for dark theme", () => {
            applyTheme("dark");
            expect(document.documentElement.classList.contains("dark")).toBe(
                true,
            );
        });

        it("removes dark class on html for light theme", () => {
            document.documentElement.classList.add("dark");
            applyTheme("light");
            expect(document.documentElement.classList.contains("dark")).toBe(
                false,
            );
        });
    });

    describe("setTheme", () => {
        it("persists theme and applies dark class", () => {
            setTheme("dark");
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
            expect(document.documentElement.classList.contains("dark")).toBe(
                true,
            );
        });

        it("persists light theme and removes dark class", () => {
            document.documentElement.classList.add("dark");
            setTheme("light");
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
            expect(document.documentElement.classList.contains("dark")).toBe(
                false,
            );
        });
    });

    describe("toggleTheme", () => {
        it("switches from light to dark", () => {
            const next = toggleTheme();
            expect(next).toBe("dark");
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
            expect(getThemeFromDocument()).toBe("dark");
        });

        it("switches from dark to light", () => {
            setTheme("dark");
            const next = toggleTheme();
            expect(next).toBe("light");
            expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");
            expect(getThemeFromDocument()).toBe("light");
        });
    });
});
