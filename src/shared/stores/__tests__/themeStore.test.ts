import {
    ResolvedTheme,
    ThemeHost,
    ThemePreference,
    ThemeStore
} from "@/shared/stores/themeStore";

function createHost(options?: {
    storedPreference?: string | null;
    systemTheme?: ResolvedTheme;
}) {
    let storedPreference = options?.storedPreference ?? null;
    let systemTheme = options?.systemTheme ?? "light";
    let systemListener: ((theme: ResolvedTheme) => void) | undefined;
    const appliedThemes: ResolvedTheme[] = [];

    const host: ThemeHost = {
        readPreference: () => storedPreference,
        writePreference: (preference: ThemePreference) => {
            storedPreference = preference;
        },
        getSystemTheme: () => systemTheme,
        subscribeSystemTheme: (listener) => {
            systemListener = listener;
            return () => {
                systemListener = undefined;
            };
        },
        applyTheme: (theme) => appliedThemes.push(theme)
    };

    return {
        host,
        appliedThemes,
        getStoredPreference: () => storedPreference,
        setSystemTheme: (theme: ResolvedTheme) => {
            systemTheme = theme;
            systemListener?.(theme);
        }
    };
}

test("defaults to the system preference and applies the resolved theme", () => {
    const fixture = createHost({ systemTheme: "dark" });
    const store = new ThemeStore(fixture.host);

    store.initialize();

    expect(store.getSnapshot()).toEqual({
        preference: "system",
        resolvedTheme: "dark"
    });
    expect(fixture.appliedThemes).toEqual(["dark"]);
});

test("restores and persists explicit preferences", () => {
    const fixture = createHost({
        storedPreference: "dark",
        systemTheme: "light"
    });
    const store = new ThemeStore(fixture.host);
    const listener = jest.fn();
    store.subscribe(listener);

    store.initialize();
    store.setPreference("light");

    expect(store.getSnapshot()).toEqual({
        preference: "light",
        resolvedTheme: "light"
    });
    expect(fixture.getStoredPreference()).toBe("light");
    expect(fixture.appliedThemes).toEqual(["dark", "light"]);
    expect(listener).toHaveBeenCalledTimes(1);
});

test("follows system changes only while the system preference is selected", () => {
    const fixture = createHost({ systemTheme: "light" });
    const store = new ThemeStore(fixture.host);
    const listener = jest.fn();
    store.subscribe(listener);
    store.initialize();

    fixture.setSystemTheme("dark");
    expect(store.getSnapshot().resolvedTheme).toBe("dark");
    expect(listener).toHaveBeenCalledTimes(1);

    store.setPreference("light");
    fixture.setSystemTheme("dark");
    expect(store.getSnapshot()).toEqual({
        preference: "light",
        resolvedTheme: "light"
    });
    expect(listener).toHaveBeenCalledTimes(2);
});

test("falls back to system when a stored preference is invalid", () => {
    const fixture = createHost({
        storedPreference: "sepia",
        systemTheme: "dark"
    });
    const store = new ThemeStore(fixture.host);

    store.initialize();

    expect(store.getSnapshot()).toEqual({
        preference: "system",
        resolvedTheme: "dark"
    });
});
