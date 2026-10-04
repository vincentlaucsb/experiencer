import { documentNotesStore } from './documentNotesStore';
import { resumeNodeStore } from './resumeNodeStore';
import { getEntryNotes, containingEntry } from './entryNotes';
import type { ResumeNode } from '@/types';

/** Owns read-only note selection for local hosts without an editing implementation. */
export class ReadOnlyNotesStore {
    private selection?: { uuid?: string; generation: number };
    private snapshot?: ReturnType<ReadOnlyNotesStore['read']>;
    private listeners = new Set<() => void>();
    private stops: (() => void)[];
    constructor() {
        this.stops = [documentNotesStore.subscribe(this.changed), resumeNodeStore.subscribe(this.changed)];
    }
    dispose = () => this.stops.forEach(stop => stop());
    subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
    private changed = () => {
        if (this.selection && (this.selection.generation !== documentNotesStore.loadGeneration
            || (this.selection.uuid && !resumeNodeStore.getNodeByUuid(this.selection.uuid)))) this.selection = undefined;
        this.snapshot = undefined; this.listeners.forEach(listener => listener());
    };
    private read = () => {
        const entries = getEntryNotes();
        const entry = entries.find(item => item.uuid === this.selection?.uuid);
        return { data: documentNotesStore.data, entries, selected: this.selection
            ? { title: entry?.title ?? 'General guidance', markdown: entry?.markdown ?? documentNotesStore.data?.markdown ?? '' } : undefined };
    };
    getSnapshot = () => this.snapshot ??= this.read();
    open = (uuid?: string) => { this.selection = { uuid, generation: documentNotesStore.loadGeneration }; this.changed(); };
    close = () => { this.selection = undefined; this.changed(); };
    nodeActions = (node: ResumeNode) => {
        const entry = containingEntry(node);
        return entry ? [{ id: 'entry-notes', label: entry.notes ? 'View Notes' : 'Add Notes',
            treeIndicator: node.uuid === entry.uuid && entry.notes ? 'Notes' : undefined,
            treeIndicatorIcon: 'icofont-clip-board', run: () => this.open(entry.uuid) }] : [];
    };
}
export const readOnlyNotesStore = new ReadOnlyNotesStore();
