import PageSize from '@/types/PageSize';
import { getPageHeightPixels } from '@/shared/utils/pageDimensions';
import { emptyResumeTextOverflow, measureResumeTextOverflow, observeResumeTextOverflow, type ResumeTextOverflow } from '@/shared/utils/resumeTextOverflow';

/** Owns the active editor's transient geometry advisory; persisted documents remain untouched. */
class ResumeTextOverflowStore {
    private snapshot = emptyResumeTextOverflow;
    private listeners = new Set<() => void>();
    private binding?: { root: HTMLElement; pageSize: PageSize };
    getSnapshot = () => this.snapshot;
    subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener); };
    measureCurrent = (): ResumeTextOverflow => {
        const binding = this.binding;
        if (!binding) return emptyResumeTextOverflow;
        // Print may follow an edit before observer work runs; never rely on a previous frame.
        const value = measureResumeTextOverflow(binding.root,
            getPageHeightPixels(binding.root.getBoundingClientRect().width, binding.pageSize));
        this.publish(value);
        return value;
    };
    bind(root: HTMLElement, pageSize: PageSize): () => void {
        const binding = { root, pageSize };
        this.binding = binding;
        const dispose = observeResumeTextOverflow(root,
            () => getPageHeightPixels(root.getBoundingClientRect().width, pageSize), this.publish);
        return () => {
            dispose();
            if (this.binding !== binding) return;
            this.binding = undefined;
            this.publish(emptyResumeTextOverflow);
        };
    }
    private publish = (value: ResumeTextOverflow) => {
        if (JSON.stringify(value) === JSON.stringify(this.snapshot)) return;
        this.snapshot = value;
        this.listeners.forEach(listener => listener());
    };
}
export const resumeTextOverflowStore = new ResumeTextOverflowStore();
