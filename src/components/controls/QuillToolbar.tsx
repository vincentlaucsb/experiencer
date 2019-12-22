import React from "react";

export interface QuillToolbarProps {
    selectTriggerProps: any;
}

export default function QuillToolbar(props: QuillToolbarProps) {
    let [offset, setOffset] = React.useState(0);
    let ref = React.createRef<HTMLDivElement>();

    React.useEffect(() => {
        if (ref.current) {
            const toolbarHeight = ref.current.getBoundingClientRect().height;
            if (toolbarHeight !== offset) {
                setOffset(toolbarHeight);
            }
        }
    });

    return <div style={{
        position: "relative",
        background: "black",
        height: 0,
        top: -offset
    }}>
        <div id="quill-toolbar" ref={ref} style={{ position: "absolute" }} {...props.selectTriggerProps}>
            <span className="ql-formats">
                <button className="ql-bold" type="button"></button>
                <button className="ql-italic" type="button"></button>
                <button className="ql-underline" type="button"></button>
                <button className="ql-strike" type="button"></button>
            </span>
            <span className="ql-formats">
                <button className="ql-list" type="button" value="ordered"></button>
                <button className="ql-list" type="button" value="bullet"></button>
            </span>
            <span className="ql-formats">
                <button className="ql-link" type="button"></button>
                <button className="ql-image" type="button"></button>
            </span>
            <span className="ql-formats">
                <span className="ql-align ql-picker ql-icon-picker"></span>
                <select className="ql-align" style={{ display: "none" }}></select>
            </span>
            <span className="ql-formats">
                <button className="ql-clean" type="button"></button>
            </span>
        </div>
    </div>
}