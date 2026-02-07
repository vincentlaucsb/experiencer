import * as React from "react";
import { RowProps, BasicRowProps } from "./Row";
import QuillEditor from "@/controls/inputs/QuillEditor";
import Container from "./Container";
import { useIsNodeEditing } from "@/shared/stores/editorStore";

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

    let value = <h1 dangerouslySetInnerHTML={{ __html: props.value || "Enter a title" }} />
    let subtitle = <h2 className="subtitle" dangerouslySetInnerHTML={{ __html: props.subtitle || "" }} />

    if (isEditing) {
        value = <QuillEditor
            id={`${props.uuid}-title`}
            value={props.value || ""}
            onChange={(text) => props.updateData("value", text)}
        />

        subtitle = <QuillEditor
            id={`${props.uuid}-subtitle`}
            value={props.subtitle || ""}
            onChange={(text) => props.updateData("subtitle", text)}
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