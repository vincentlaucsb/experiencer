import * as React from "react";
import { useRef } from "react";
import InlineMarkdown from "../helpers/InlineMarkdown";
import Container from "@/resume/infrastructure/Container";
import { useEditorStore, useIsNodeEditing } from "@/shared/stores/editorStore";
import { RowBase } from "../Row";
import useEditingHotkeys from "../hooks/useEditingHotkeys";
import useAutoExpandInput from "../hooks/useAutoExpandInput";

import "./index.scss";
import ResumeComponentProps, { BasicResumeNode } from "@/types";

interface HeaderBase extends RowBase {
    distribution?: 'top-to-bottom' | 'left-to-right' | 'bottom-to-top' | 'right-to-left';
    justifyContent?: string;
    subtitle?: string;
}

export interface BasicHeaderProps extends BasicResumeNode<HeaderBase> {};
export interface HeaderProps extends ResumeComponentProps<HeaderBase> {};

export default function Header({ updateDataFields, ...props }: HeaderProps) {
    const isEditing = useIsNodeEditing(props.uuid);
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const titleRef = useRef<HTMLInputElement>(null);
    const subtitleRef = useRef<HTMLInputElement>(null);

    useAutoExpandInput(
        titleRef as React.RefObject<HTMLInputElement>,
        subtitleRef as React.RefObject<HTMLInputElement>
    );

    const editValue = {
        value: props.value || "",
        subtitle: props.subtitle || "",
    };

    useEditingHotkeys({
        isEditing,
        ctrlEnter: false,
        value: editValue,
        onChange: updateDataFields,
        toggleEditing: toggleEdit,
    });

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
            ref={titleRef}
            id={`${props.uuid}-title`}
            type="text"
            value={props.value || ""}
            onChange={(e) => props.updateData("value", e.target.value)}
            placeholder="Enter a title"
        />

        subtitle = <input
            ref={subtitleRef}
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