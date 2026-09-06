import { useCallback, useSyncExternalStore } from 'react';
import { idleResumeDocumentStatusSource, type ResumeDocumentStatusSource } from '@/shared/stores/ResumeDocumentStatusSource';

export function useResumeDocumentStatus(documentId: string, source: ResumeDocumentStatusSource = idleResumeDocumentStatusSource) {
    const subscribe = useCallback((listener: () => void) => source.subscribe(documentId, listener), [source, documentId]);
    const snapshot = useCallback(() => source.getSnapshot(documentId), [source, documentId]);
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}
