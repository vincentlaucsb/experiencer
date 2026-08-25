import { cssStore, rootCssStore } from "./cssStoreHooks";
import { documentFontsStore } from "./documentFontsStore";
import { useEditorStore } from "./editorStore";
import { resumeNodeStore } from "./resumeNodeStore";

/** Canonical read model for changes belonging to the active résumé document. */
export const resumeDocumentDirtyState = {
    subscribe(listener: () => void): () => void {
        const unsubscribe = [
            resumeNodeStore.subscribe(listener),
            cssStore.subscribe(listener),
            rootCssStore.subscribe(listener),
            documentFontsStore.subscribe(listener),
            useEditorStore.subscribe(listener)
        ];
        return () => unsubscribe.forEach((stop) => stop());
    },

    getSnapshot(): boolean {
        return resumeNodeStore.hasUnsavedChanges()
            || cssStore.hasUnsavedChanges()
            || rootCssStore.hasUnsavedChanges()
            || documentFontsStore.hasUnsavedChanges()
            || useEditorStore.getState().hasUnsavedPageSizeChanges;
    }
};
