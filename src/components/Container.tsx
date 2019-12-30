import React from "react";
import { IdType } from "./utility/HoverTracker";

interface SelectTriggerProps {
    id: IdType;
    uuid: string;
    selectedUuid?: string;

    hoverOver: (id: IdType) => void;
    hoverOut: (id: IdType) => void;
    isSelectBlocked: (id: IdType) => boolean;
    updateSelected: (id: IdType) => void;
}

export interface ContainerProps extends SelectTriggerProps {
    children: React.ReactNode;
    className?: string;
    displayAs?: string;
    emptyText?: string; // TODO: Do something
    htmlId?: string;
    style?: React.CSSProperties;
}

export function selectTriggerProps(props: SelectTriggerProps) {
    const isSelected = props.selectedUuid === props.uuid;

    return {
        onClick: (event: React.MouseEvent) => {
            // isSelectBlocked prevents us from selecting a parent
            // node
            if (!isSelected && !props.isSelectBlocked(props.id)) {
                props.updateSelected(props.id);
                event.stopPropagation();
            }
        },
        onMouseEnter: () => {
            props.hoverOver(props.id);
        },
        onMouseLeave: () => {
            props.hoverOut(props.id);
        }
    };
}

/**
 * Generic parent-level container for resume components
 * @param props
 */
export default function Container(props: ContainerProps) {
    const displayAs = props.displayAs || "div";

    let newProps = {
        children: props.children,
        className: props.className,
        style: props.style,
        id: props.htmlId,
        ...selectTriggerProps(props)
    }

    return React.createElement(displayAs, newProps);
}