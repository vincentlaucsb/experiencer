import UiwMarkdownEditor from "./UiwMarkdownEditor";
import type { MarkdownEditorComponent } from "./types";

export type { MarkdownEditorComponent, MarkdownEditorProps } from "./types";
export { default as TextareaMarkdownEditor } from "./TextareaMarkdownEditor";
export { default as UiwMarkdownEditor } from "./UiwMarkdownEditor";

let activeMarkdownEditor: MarkdownEditorComponent = UiwMarkdownEditor;

/**
 * Returns the editor used by Markdown nodes. Configure this once during app
 * startup when a different editor implementation is preferred.
 */
export function getMarkdownEditor(): MarkdownEditorComponent {
    return activeMarkdownEditor;
}

/** Replace the Markdown editing surface without changing stored resume data. */
export function configureMarkdownEditor(editor: MarkdownEditorComponent): void {
    activeMarkdownEditor = editor;
}

/** Restore the bundled editor; useful for app teardown and isolated tests. */
export function resetMarkdownEditor(): void {
    activeMarkdownEditor = UiwMarkdownEditor;
}
