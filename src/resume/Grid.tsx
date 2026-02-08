import React, { useMemo } from "react";
import Container from "@/resume/infrastructure/Container";
import ResumeComponentProps from "@/types";

export default function Grid({ children, ...props }: ResumeComponentProps) {
    const isEmpty = useMemo(() => {
        return props.childNodes === undefined || props.childNodes.length === 0
    }, [props.childNodes]);

    const style = useMemo(() => {
        let ret: React.CSSProperties = {
            display: "grid",
        };

        if (isEmpty) {
            ret.minWidth = '100px';
            ret.minHeight = '100px';
        }

        return ret;
    }, [children]);

    const helperText = isEmpty ? <span>
        This grid is empty. Click here to select it and add items.
        </span>  : <></>

    return (
        <Container {...props} className="grid-container"
            style={style}>
            {helperText}
            {children}
        </Container>
    );
}

Grid.type = 'Grid';