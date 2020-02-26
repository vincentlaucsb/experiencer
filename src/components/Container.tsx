import React from "react";
import { IdType, SelectedNodeManagement } from "./utility/Types";
import ResumeContext from "src/ResumeContext";

interface SelectTriggerProps extends SelectedNodeManagement {
    id: IdType;
    uuid: string;
    isEditing: boolean;
}

export interface ContainerProps {
    id: IdType;
    uuid: string;

    children?: React.ReactNode;
    className?: string;
    displayAs?: string;
    emptyText?: string; // TODO: Do something
    htmlId?: string;
    style?: React.CSSProperties;
}

export function selectTriggerProps(props: SelectTriggerProps) {
    return {
        onClick: () => {
            props.updateClicked(props.id);
        },

        onContextMenu: (event: React.MouseEvent) => {
            if (props.isEditing) {
                // If editing, use default context menu
                // so user can use browser's spellcheck, etc.
                event.stopPropagation();
            }
            else {
                props.updateClicked(props.id);
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
    let classes = [props.className];
    
    return (
        <ResumeContext.Consumer>
            {(value) => {
                const isSelected = value.selectedUuid === props.uuid;
                if (isSelected) {
                    classes = classes.concat('resume-selected');
                }

                const newProps = {
                    children: props.children,
                    className: classes.join(' '),
                    style: props.style,
                    id: props.htmlId,
                    ...selectTriggerProps({
                        updateClicked: value.updateClicked,
                        isEditing: value.isEditingSelected,
                        ...props
                    })
                }

                return (
                    <>
                        {React.createElement(displayAs, newProps)}
                    </>
                )

            }}
        </ResumeContext.Consumer>
    );
}