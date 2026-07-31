export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

export interface ThemeSnapshot {
    preference: ThemePreference;
    resolvedTheme: ResolvedTheme;
}

export interface ThemeHost {
    readPreference(): string | null;
    writePreference(preference: ThemePreference): void;
    getSystemTheme(): ResolvedTheme;
    subscribeSystemTheme(listener: (theme: ResolvedTheme) => void): () => void;
    applyTheme(theme: ResolvedTheme): void;
}

export const themePreferenceStorageKey = "experiencer.theme";

const isThemePreference = (value: string | null): value is ThemePreference =>
    value === "system" || value === "light" || value === "dark";

const initialSnapshot: ThemeSnapshot = {
    preference: "system",
    resolvedTheme: "light"
};

/**
 * Owns the user's UI-theme preference independently of React.
 *
 * Resume document colors remain outside this store and are print-invariant.
 */
export class ThemeStore {
    private snapshot: ThemeSnapshot = initialSnapshot;
    private listeners = new Set<() => void>();
    private initialized = false;
    private unsubscribeSystemTheme?: () => void;

    constructor(private readonly host: ThemeHost) {}

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    initialize = () => {
        if (this.initialized) {
            return;
        }

        this.initialized = true;
        const storedPreference = this.host.readPreference();
        const preference = isThemePreference(storedPreference)
            ? storedPreference
            : "system";
        const resolvedTheme = this.resolve(preference);

        this.snapshot = { preference, resolvedTheme };
        this.host.applyTheme(resolvedTheme);
        this.unsubscribeSystemTheme = this.host.subscribeSystemTheme(
            this.handleSystemThemeChange
        );
    };

    setPreference = (preference: ThemePreference) => {
        this.initialize();
        const resolvedTheme = this.resolve(preference);

        this.host.writePreference(preference);
        if (
            this.snapshot.preference === preference
            && this.snapshot.resolvedTheme === resolvedTheme
        ) {
            return;
        }

        this.snapshot = { preference, resolvedTheme };
        this.host.applyTheme(resolvedTheme);
        this.emit();
    };

    destroy = () => {
        this.unsubscribeSystemTheme?.();
        this.unsubscribeSystemTheme = undefined;
        this.initialized = false;
        this.listeners.clear();
    };

    private resolve(preference: ThemePreference): ResolvedTheme {
        return preference === "system"
            ? this.host.getSystemTheme()
            : preference;
    }

    private handleSystemThemeChange = (resolvedTheme: ResolvedTheme) => {
        if (
            this.snapshot.preference !== "system"
            || this.snapshot.resolvedTheme === resolvedTheme
        ) {
            return;
        }

        this.snapshot = {
            preference: "system",
            resolvedTheme
        };
        this.host.applyTheme(resolvedTheme);
        this.emit();
    };

    private emit() {
        this.listeners.forEach((listener) => listener());
    }
}

const createBrowserThemeHost = (): ThemeHost => {
    const mediaQuery = typeof window !== "undefined" && window.matchMedia
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : undefined;

    return {
        readPreference: () => {
            try {
                return localStorage.getItem(themePreferenceStorageKey);
            } catch {
                return null;
            }
        },
        writePreference: (preference) => {
            try {
                localStorage.setItem(themePreferenceStorageKey, preference);
            } catch {
                // A blocked storage API should not prevent theme selection.
            }
        },
        getSystemTheme: () => mediaQuery?.matches ? "dark" : "light",
        subscribeSystemTheme: (listener) => {
            if (!mediaQuery) {
                return () => undefined;
            }

            const handleChange = (event: MediaQueryListEvent) => {
                listener(event.matches ? "dark" : "light");
            };
            mediaQuery.addEventListener("change", handleChange);
            return () => mediaQuery.removeEventListener("change", handleChange);
        },
        applyTheme: (theme) => {
            if (typeof document === "undefined") {
                return;
            }

            document.documentElement.dataset.theme = theme;
            document.documentElement.style.colorScheme = theme;
        }
    };
};

export const themeStore = new ThemeStore(createBrowserThemeHost());
