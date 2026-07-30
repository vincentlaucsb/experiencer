import { useSyncExternalStore } from "react";

import {
    isEditingMode,
    workspaceStore
} from "./workspaceStore";

export const useWorkspaceSnapshot = () => useSyncExternalStore(
    workspaceStore.subscribe,
    workspaceStore.getSnapshot,
    workspaceStore.getSnapshot
);

export const useMode = () => useWorkspaceSnapshot().mode;

export const useIsEditing = () => isEditingMode(useWorkspaceSnapshot().mode);
