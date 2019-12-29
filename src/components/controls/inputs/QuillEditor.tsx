import QuillToolbar from "./QuillToolbar";
import React from "react";
import ReactQuill from "react-quill";

export interface QuillEditorProps {
    id: string;
    value: string;

    className?: string;
    htmlId?: string;
    onChange: (value: string) => void;
}

export default function QuillEditor(props: QuillEditorProps) {
    let [showToolbar, setToolbar] = React.useState(false);

    const selectTriggerProps = {
        onClick: (event: React.MouseEvent) => {
            // Prevent <Resume>'s click handler from unselecting us
            event.stopPropagation();
        },
        onMouseEnter: () => setToolbar(true),
        onMouseLeave: () => setToolbar(false)
    }

    const toolbarId = `quill-toolbar-${props.id}`

    return (
        <div className="resume-ql" {...selectTriggerProps}>
            <QuillToolbar id={toolbarId} show={showToolbar} />
            <ReactQuill
                modules={{ toolbar: `#${toolbarId}` }}
                value={props.value}
                onChange={props.onChange}
            />
        </div>
    );
}