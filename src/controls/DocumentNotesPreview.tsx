import { useSyncExternalStore, type ReactNode } from 'react';
import { documentNotesStore } from '@/shared/stores/documentNotesStore';

/** Presents a persisted addendum read-only, with optional host-owned explanatory content. */
export default function DocumentNotesPreview({ notice }: { notice?: ReactNode }) {
    const notes = useSyncExternalStore(documentNotesStore.subscribe, documentNotesStore.getSnapshot).data;
    return <section aria-label="Document notes">
        <h2>Resume notes</h2>
        {notice}
        {notes?.markdown && <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', font: 'inherit' }} aria-label="Saved notes">{notes.markdown}</pre>}
        {notes?.templateGuidance && <details open>
            <summary>Source template guidance</summary>
            <pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', font: 'inherit' }}>{notes.templateGuidance}</pre>
        </details>}
    </section>;
}
