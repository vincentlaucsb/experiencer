import QuillToolbar from "./QuillToolbar";
import React from "react";
import ReactQuill from "react-quill";

export interface QuillEditorProps {
    id: string;
    value: string;

    className?: string;
    htmlId?: string;
    selectTriggerProps: any;
    onChange: (value: string) => void;
}

export default function QuillEditor(props: QuillEditorProps) {
    let [showToolbar, setToolbar] = React.useState(false);

    const selectTriggerProps = { ...props.selectTriggerProps };
    selectTriggerProps.onMouseEnter = () => {
        props.selectTriggerProps.onMouseEnter();
        setToolbar(true);
    };
    selectTriggerProps.onMouseLeave = () => {
        props.selectTriggerProps.onMouseLeave();
        setToolbar(false);
    }

    const toolbarId = `quill-toolbar-${props.id}`

    return (
        <div
            className={props.className} id={props.htmlId}
            {...selectTriggerProps}>
            <QuillToolbar id={toolbarId} show={showToolbar} />
            <div className="resume-ql">
                <ReactQuill
                    modules={{ toolbar: `#${toolbarId}` }}
                    value={props.value}
                    onChange={props.onChange}
                />
            </div>
        </div>
    );
}