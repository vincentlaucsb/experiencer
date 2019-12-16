import React from "react";

interface RenderIfProps {
    children?: any;
    render: boolean;
}

export function RenderIf(props: RenderIfProps) {
    if (props.render) {
        return props.children;
    }

    return <React.Fragment></React.Fragment>
}