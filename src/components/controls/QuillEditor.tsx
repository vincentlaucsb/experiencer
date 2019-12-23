import QuillToolbar from "./QuillToolbar";
import React from "react";
import ReactQuill from "react-quill";

export interface QuillEditorProps {
    className?: string;
    htmlId?: string;
    selectTriggerProps: any;
    value?: string;
    onChange: (value: string) => void;
}

export default function QuillEditor(props: QuillEditorProps) {
    return (
        <div
            className={props.className} id={props.htmlId}
            {...props.selectTriggerProps}>
            <QuillToolbar />
            <div>
                <ReactQuill
                    modules={{ toolbar: "#quill-toolbar" }}
                    value={props.value || ""}
                    onChange={props.onChange} />
            </div>
        </div>
    );
}