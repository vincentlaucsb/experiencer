import React from "react";
import { IdType, SelectedNodeManagement } from "./utility/Types";

interface SelectTriggerProps extends SelectedNodeManagement {
    id: IdType;
    uuid: string;
    isEditing: boolean;
}

export interface ContainerProps extends SelectTriggerProps {
    children?: React.ReactNode;
    className?: string;
    displayAs?: string;
    emptyText?: string; // TODO: Do something
    htmlId?: string;
    style?: React.CSSProperties;
    isEditing: boolean;
}

export function selectTriggerProps(props: SelectTriggerProps) {
    return {
        onClick: () => {
            props.clicked(props.id);
        },

        onContextMenu: (event: React.MouseEvent) => {
            if (props.isEditing) {
                // If editing, use default context menu
                // so user can use browser's spellcheck, etc.
                event.stopPropagation();
            }
            else {
                props.clicked(props.id);
            }
        }
    };
}

/**
 * Generic parent-level container for resume components
 * @param props
 */
export default function Container(props: ContainerProps) {
    const displayAs = props.displayAs || "div";
    const isSelected = props.selectedUuid === props.uuid;

    let classes = [props.className];
    if (isSelected) {
        classes = classes.concat('resume-selected');
    }

    let newProps = {
        children: props.children,
        className: classes.join(' '),
        style: props.style,
        id: props.htmlId,
        ...selectTriggerProps(props)
    }
    
    return React.createElement(displayAs, newProps);
}