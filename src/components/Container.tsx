import React from "react";
import { IdType, SelectedNodeManagement } from "./utility/Types";

interface SelectTriggerProps extends SelectedNodeManagement {
    id: IdType;
    uuid: string;
}

export interface ContainerProps extends SelectTriggerProps {
    children?: React.ReactNode;
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