import ClassStore from '@/shared/ClassStore';
import type { ResumeNotes } from '@/types';

export const MAXIMUM_NOTES_LENGTH = 32_000;

/** Owns the serializable, non-rendered addendum of the active document. */
export class DocumentNotesStore extends ClassStore<ResumeNotes | undefined> {
    protected _data: ResumeNotes | undefined;
    loadGeneration = 0;
    private pendingEdit = false;

    constructor() {
        super();
        this.load(undefined);
    }

    load(notes: unknown): void {
        this.loadGeneration++;
        this.pendingEdit = false;
        this.withMutation(() => {
            if (!notes || typeof notes !== 'object' || Array.isArray(notes)) {
                this.data = undefined;
                return;
            }
            const value = notes as Partial<ResumeNotes>;
            this.data = typeof value.markdown === 'string'
                ? { markdown: value.markdown, ...(typeof value.templateGuidance === 'string'
                    ? { templateGuidance: value.templateGuidance } : {}) }
                : undefined;
        });
        this.clearUnsavedChanges();
    }

    /** Keeps invalid editor drafts visible to navigation without putting them in saved JSON. */
    setPendingEdit(pending: boolean): void {
        if (this.pendingEdit === pending) return;
        this.pendingEdit = pending;
        this.notifyListeners();
    }

    hasUnsavedChanges(): boolean {
        return this.pendingEdit || super.hasUnsavedChanges();
    }

    setMarkdown(markdown: string): boolean {
        if (markdown.length > MAXIMUM_NOTES_LENGTH || markdown === (this.data?.markdown ?? '')) return false;
        this.withMutation(() => {
            this.data = { ...this.data, markdown };
        });
        return true;
    }
}

export const documentNotesStore = new DocumentNotesStore();
