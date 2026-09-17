import { useSyncExternalStore, type ReactNode } from 'react';
import Markdown from 'react-markdown';
import { readOnlyNotesStore } from '@/shared/stores/readOnlyNotesStore';
import Modal from './Modal';
import { Button } from './Buttons';

/** Presents private addenda read-only, with optional host-owned explanatory content. */
export default function DocumentNotesPreview({ notice }: { notice?: ReactNode }) {
    const { data: notes, entries } = useSyncExternalStore(readOnlyNotesStore.subscribe, readOnlyNotesStore.getSnapshot);
    return <section aria-label="Document notes">
        <h2>Resume notes</h2>{notice}<h3>General guidance</h3>
        <div aria-label="Saved notes"><Markdown>{notes?.markdown || 'No general guidance yet.'}</Markdown></div>
        <Button onClick={() => readOnlyNotesStore.open()}>View general guidance</Button>
        {notes?.templateGuidance && <details open><summary>Source template guidance</summary>
            <Markdown>{notes.templateGuidance}</Markdown></details>}
        {entries.filter(entry => entry.markdown).map(entry => <article key={entry.uuid}><h3>{entry.title}</h3>
            {entry.hidden && <p>Hidden from resume</p>}<Markdown>{entry.markdown}</Markdown>
            <Button onClick={() => readOnlyNotesStore.open(entry.uuid)}>View Notes</Button></article>)}
    </section>;
}

/** Keeps the shared modal mounted so its focus and accessibility cleanup follows open/close transitions. */
export function ReadOnlyNotesModal({ notice }: { notice?: ReactNode }) {
    const { selected } = useSyncExternalStore(readOnlyNotesStore.subscribe, readOnlyNotesStore.getSnapshot);
    return <Modal isOpen={Boolean(selected)} close={readOnlyNotesStore.close} title="View Notes" className="document-notes-modal">
        <div>{selected && <><h4>{selected.title}</h4><Markdown>{selected.markdown || 'No notes yet.'}</Markdown>{notice}</>}</div>
    </Modal>;
}
