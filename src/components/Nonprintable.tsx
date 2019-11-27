import React from "react";

interface NonprintableProps {
    children?: any;
    isPrinting?: boolean;
}

export function Nonprintable(props: NonprintableProps) {
    if (props.isPrinting) {
        return <></>
    }

    return <>{props.children}</>
}