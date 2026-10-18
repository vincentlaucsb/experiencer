import * as React from "react";
import { useRef } from "react";
import InlineMarkdown from "../helpers/InlineMarkdown";
import Container from "@/resume/infrastructure/Container";
import { useEditorStore, useIsNodeEditing } from "@/shared/stores/editorStore";
import { useResumeSpellCheck } from "@/shared/stores/resumeSpellCheckHooks";
import { RowBase } from "../Row";
import useEditingControls from "../hooks/useEditingControls";
import useAutoExpandInput from "../hooks/useAutoExpandInput";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import { Button } from '@/controls/Buttons';
import { createPortal } from 'react-dom';

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
    const isEditing = useIsNodeEditing(props.uuid) && !props.readOnly;
    const toggleEdit = useEditorStore((state) => state.toggleEdit);
    const spellCheck = useResumeSpellCheck();
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

    const { save, cancel } = useEditingControls({
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

    let value = <h1><InlineMarkdown>{props.readOnly ? (props.value || "") : (props.value || "Enter a title")}</InlineMarkdown></h1>
    let subtitle = <h2 className="subtitle"><InlineMarkdown>{props.subtitle || ""}</InlineMarkdown></h2>

    if (isEditing) {
        value = <h1><input
            {...nonCredentialInputAttributes}
            ref={titleRef}
            id={`${props.uuid}-title`}
            aria-label="Title"
            autoFocus
            type="text"
            spellCheck={spellCheck}
            value={props.value || ""}
            onChange={(e) => props.updateData("value", e.target.value)}
            placeholder="Enter a title"
        /></h1>

        subtitle = <h2 className="subtitle"><input
            {...nonCredentialInputAttributes}
            ref={subtitleRef}
            id={`${props.uuid}-subtitle`}
            aria-label="Subtitle"
            type="text"
            spellCheck={spellCheck}
            value={props.subtitle || ""}
            onChange={(e) => props.updateData("subtitle", e.target.value)}
            placeholder="Enter a subtitle"
        /></h2>
    }
    
    return (
        <><Container displayAs="header" {...props} style={style}>
            <hgroup>
                {value}
                {subtitle}
            </hgroup>
            {props.children}
        </Container>
            {isEditing && createPortal(<div role="toolbar" aria-label="Header editing" className="header-edit-actions no-print app-gap-2 app-p-3" onClick={event => event.stopPropagation()}>
                <Button variant="primary" onClick={save}>Done</Button>
                <Button onClick={cancel}>Cancel</Button>
                <span>Enter to finish · Escape to cancel</span>
            </div>, document.body)}
        </>
    );
}

Header.type = 'Header';
