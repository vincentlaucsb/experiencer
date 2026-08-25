import { lazy, Suspense } from "react";

import TextareaMarkdownEditor from "./TextareaMarkdownEditor";
import type { MarkdownEditorProps } from "./types";

const UiwMarkdownEditor = lazy(async () => {
    try {
        return await import("./UiwMarkdownEditor");
    } catch {
        return { default: TextareaMarkdownEditor };
    }
});

/** Loads the rich editor only when a Markdown node enters editing mode. */
export default function LazyUiwMarkdownEditor(props: MarkdownEditorProps) {
    return (
        <Suspense fallback={<TextareaMarkdownEditor {...props} />}>
            <UiwMarkdownEditor {...props} />
        </Suspense>
    );
}
