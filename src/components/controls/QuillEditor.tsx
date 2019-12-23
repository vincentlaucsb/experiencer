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
    let [showToolbar, setToolbar] = React.useState(true);

    const selectTriggerProps = { ...props.selectTriggerProps };
    selectTriggerProps.onMouseEnter = () => {
        props.selectTriggerProps.onMouseEnter();
        setToolbar(true);
    };
    selectTriggerProps.onMouseLeave = () => {
        props.selectTriggerProps.onMouseLeave();
        setToolbar(false);
    }

    return (
        <div
            className={props.className} id={props.htmlId}
            {...selectTriggerProps}>
            <QuillToolbar show={showToolbar} />
            <div>
                <ReactQuill
                    modules={{ toolbar: "#quill-toolbar" }}
                    value={props.value || ""}
                    onChange={props.onChange}
                />
            </div>
        </div>
    );
}