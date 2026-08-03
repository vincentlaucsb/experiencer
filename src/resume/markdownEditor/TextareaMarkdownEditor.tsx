import type { MarkdownEditorProps } from "./types";

import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

/** Minimal source editor retained as a dependency-free fallback adapter. */
export default function TextareaMarkdownEditor(props: MarkdownEditorProps) {
    return (
        <textarea
            {...nonCredentialInputAttributes}
            className="resume-overlay-input resume-overlay-textarea app-p-2"
            id={props.id}
            aria-label={props.ariaLabel}
            value={props.value}
            onChange={(event) => props.onChange(event.target.value)}
            placeholder={props.placeholder}
            autoFocus={props.autoFocus}
        />
    );
}
