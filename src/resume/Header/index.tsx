import * as React from "react";
import { useIsNodeEditing } from "@/shared/stores/editorStore";
import InlineMarkdown from "../helpers/InlineMarkdown";
import Container from "../Container";
import { RowProps, BasicRowProps } from "../Row";

import "./index.scss";

interface HeaderBase {
    distribution?: 'top-to-bottom' | 'left-to-right' | 'bottom-to-top' | 'right-to-left';
    justifyContent?: string;
    subtitle?: string;
}

export interface BasicHeaderProps extends BasicRowProps, HeaderBase { };
export interface HeaderProps extends RowProps, HeaderBase { };

export default function Header(props: HeaderProps) {
    const isEditing = useIsNodeEditing(props.uuid);

    const style: React.CSSProperties = {
        display: 'flex',
        justifyContent: props.justifyContent || 'space-between',
    };

    switch (props.distribution || 'top-to-bottom') {
        case 'top-to-bottom':
            style.flexDirection = 'column';
            break;
        case 'bottom-to-top':
            style.flexDirection = 'column-reverse';
            break;
        case 'left-to-right':
            style.flexDirection = 'row';
            break;
        case 'right-to-left':
            style.flexDirection = 'row-reverse';
            break;
    }

    let value = <h1><InlineMarkdown>{props.value || "Enter a title"}</InlineMarkdown></h1>
    let subtitle = <h2 className="subtitle"><InlineMarkdown>{props.subtitle || ""}</InlineMarkdown></h2>

    if (isEditing) {
        value = <input
            id={`${props.uuid}-title`}
            type="text"
            value={props.value || ""}
            onChange={(e) => props.updateData("value", e.target.value)}
            placeholder="Enter a title"
        />

        subtitle = <input
            id={`${props.uuid}-subtitle`}
            type="text"
            value={props.subtitle || ""}
            onChange={(e) => props.updateData("subtitle", e.target.value)}
            placeholder="Enter a subtitle"
        />
    }
    
    return (
        <Container displayAs="header" {...props} style={style}>
            <hgroup>
                {value}
                {subtitle}
            </hgroup>
            {props.children}
        </Container>
    );
}

Header.type = 'Header';