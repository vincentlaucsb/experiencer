import React from "react";

export interface QuillToolbarProps {
    id: string;
    show: boolean;
}

export default function QuillToolbar(props: QuillToolbarProps) {
    let [offset, setOffset] = React.useState(0);
    let ref = React.createRef<HTMLDivElement>();
    let containerStyle: React.CSSProperties = {
        position: "relative",
        background: "black",
        height: 0,
        top: -offset
    };

    if (!props.show) {
        containerStyle.display = "none";
    }

    React.useEffect(() => {
        if (ref.current) {
            const toolbarHeight = ref.current.getBoundingClientRect().height;
            if (toolbarHeight !== offset) {
                setOffset(toolbarHeight);
            }
        }
    }, [ref, offset]);

    return <div style={containerStyle}>
        <div id={props.id} ref={ref} style={{ position: "absolute" }} className="quill-toolbar">
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