import MDEditor from "@uiw/react-md-editor";

import type { MarkdownEditorProps } from "./types";

import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

import "@uiw/react-md-editor/markdown-editor.css";

/** Adapts the selected third-party Markdown editor to the resume editor contract. */
export default function UiwMarkdownEditor(props: MarkdownEditorProps) {
    return (
        <div className="resume-markdown-editor" data-color-mode="light">
            <MDEditor
                value={props.value}
                onChange={(value) => props.onChange(value ?? "")}
                preview="edit"
                height={220}
                autoFocus={props.autoFocus}
                textareaProps={{
                    ...nonCredentialInputAttributes,
                    id: props.id,
                    "aria-label": props.ariaLabel,
                    placeholder: props.placeholder,
                }}
                highlightEnable={false}
            />
        </div>
    );
}
