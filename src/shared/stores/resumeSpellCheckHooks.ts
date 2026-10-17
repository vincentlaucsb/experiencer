import { useSyncExternalStore } from "react";

import { resumeSpellCheckStore } from "./resumeSpellCheckStore";

export const useResumeSpellCheck = () => useSyncExternalStore(
    resumeSpellCheckStore.subscribe,
    resumeSpellCheckStore.getSnapshot,
    resumeSpellCheckStore.getSnapshot
);
