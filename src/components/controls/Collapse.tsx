import React from "react";

interface CollapseProps {
    isOpen?: boolean;
    children?: any;
    trigger: any;
}

export default function Collapse(props: CollapseProps) {
    let [open, setOpen] = React.useState(props.isOpen || false);
    let contentStyle: React.CSSProperties = {};
    if (!open) {
        contentStyle = {
            display: "none"
        };
    }

    return (<>
        <div onClick={() => setOpen(!open)}>{props.trigger}</div>
        <div style={ contentStyle }>{props.children}</div>
    </>);
}