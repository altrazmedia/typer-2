export const THEME_STORAGE_KEY = "typer-theme";

export type Theme = "light" | "dark";

const themeListeners = new Set<() => void>();

function notifyThemeChange(): void {
    for (const listener of themeListeners) {
        listener();
    }
}

export function readStoredTheme(): Theme {
    if (typeof localStorage === "undefined") {
        return "light";
    }

    try {
        const stored = localStorage.getItem(THEME_STORAGE_KEY);
        if (stored === "dark" || stored === "light") {
            return stored;
        }
        return "light";
    } catch {
        return "light";
    }
}

export function applyTheme(theme: Theme): void {
    if (typeof document === "undefined") {
        return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
}

export function setTheme(theme: Theme): void {
    try {
        localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // ignore quota / private mode errors
    }

    applyTheme(theme);
    notifyThemeChange();
}

export function toggleTheme(): Theme {
    const next: Theme = getThemeFromDocument() === "dark" ? "light" : "dark";
    setTheme(next);
    return next;
}

export function getThemeFromDocument(): Theme {
    if (typeof document === "undefined") {
        return "light";
    }

    return document.documentElement.classList.contains("dark")
        ? "dark"
        : "light";
}

export function subscribeTheme(onStoreChange: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
        if (event.key !== THEME_STORAGE_KEY && event.key !== null) {
            return;
        }

        applyTheme(readStoredTheme());
        onStoreChange();
    };

    window.addEventListener("storage", onStorage);
    themeListeners.add(onStoreChange);

    return () => {
        window.removeEventListener("storage", onStorage);
        themeListeners.delete(onStoreChange);
    };
}

export function getThemeInitScript(): string {
    return `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="dark")document.documentElement.classList.add("dark");}catch(e){}})();`;
}
