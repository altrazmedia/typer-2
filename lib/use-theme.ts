"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
    getThemeFromDocument,
    setTheme as setThemeValue,
    subscribeTheme,
    toggleTheme as toggleThemeValue,
    type Theme,
} from "@/lib/theme";

export function useTheme(): {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
} {
    const theme = useSyncExternalStore(
        subscribeTheme,
        getThemeFromDocument,
        () => "light" as Theme,
    );

    const setTheme = useCallback((next: Theme) => {
        setThemeValue(next);
    }, []);

    const toggleTheme = useCallback(() => {
        toggleThemeValue();
    }, []);

    return { theme, setTheme, toggleTheme };
}
