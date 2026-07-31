import { useSyncExternalStore } from "react";

import { themeStore } from "./themeStore";

export const useThemeSnapshot = () => useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getSnapshot
);
