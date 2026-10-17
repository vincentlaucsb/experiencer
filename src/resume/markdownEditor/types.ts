import type { ComponentType } from "react";

/** Contract between the Markdown resume node and any source editor UI. */
export interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    id: string;
    ariaLabel: string;
    autoFocus?: boolean;
    placeholder?: string;
    /** Ask the browser to check spelling; editors leave it off unless requested. */
    spellCheck?: boolean;
    /** Fill a bounded host, or grow with content within the editing viewport. */
    sizing?: 'content' | 'fill';
}

export type MarkdownEditorComponent = ComponentType<MarkdownEditorProps>;
