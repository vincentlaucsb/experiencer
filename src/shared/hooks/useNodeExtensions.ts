import { useSyncExternalStore } from 'react';
import { resumeAppExtensionsStore } from '@/shared/stores/resumeAppExtensionsStore';
import type { ResumeNode } from '@/types';

/** Subscribes view adapters to host-owned node actions. */
export function useNodeExtensions(node: ResumeNode) {
    const extensions = useSyncExternalStore(resumeAppExtensionsStore.subscribe, resumeAppExtensionsStore.getSnapshot);
    return extensions.editor?.nodeActions?.(node) ?? [];
}
