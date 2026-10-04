import MDEditor from "@uiw/react-md-editor";
import { useLayoutEffect, useRef, useState } from "react";
import { MarkdownEditorSizing, MINIMUM_MARKDOWN_EDITOR_HEIGHT } from "@/shared/utils/markdownEditorSizing";

import type { MarkdownEditorProps } from "./types";

import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

import "@uiw/react-md-editor/markdown-editor.css";
import "./UiwMarkdownEditor.scss";

/** Adapts the selected third-party Markdown editor to the resume editor contract. */
export default function UiwMarkdownEditor(props: MarkdownEditorProps) {
    const host = useRef<HTMLDivElement>(null);
    const sizing = useRef<MarkdownEditorSizing | undefined>(undefined);
    const [height, setHeight] = useState(MINIMUM_MARKDOWN_EDITOR_HEIGHT);
    useLayoutEffect(() => {
        if (props.sizing === 'fill' || !host.current) return;
        const tracker = new MarkdownEditorSizing(host.current, setHeight);
        sizing.current = tracker;
        return () => { sizing.current = undefined; tracker.dispose(); };
    }, [props.sizing]);
    useLayoutEffect(() => sizing.current?.refresh(), [props.value]);
    return (
        <div ref={host} className={`resume-markdown-editor${props.sizing === 'fill' ? ' resume-markdown-editor--fill' : ''}`} data-color-mode="light">
            <MDEditor
                value={props.value}
                onChange={(value) => props.onChange(value ?? "")}
                preview="edit"
                height={props.sizing === 'fill' ? '100%' : height}
                visibleDragbar={false}
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
