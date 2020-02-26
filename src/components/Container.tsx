import React from "react";
import { IdType } from "./utility/Types";
import ResumeContext from "./ResumeContext";
import { createContainer } from "./Helpers";
import ReactDOM from "react-dom";

interface SelectTriggerProps {
    id: IdType;
    uuid: string;
    isEditing: boolean;
    updateClicked: (id: IdType) => void;
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
    const highlightContainer = createContainer("hl-box-container");
    let classes = [props.className];
    let ref = React.createRef();

    return (
        <ResumeContext.Consumer>
            {(value) => {
                const isSelected = value.selectedUuid === props.uuid;
                if (isSelected) {
                    value.updateSelectedRef(ref);
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
                    }),
                    ref: ref
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