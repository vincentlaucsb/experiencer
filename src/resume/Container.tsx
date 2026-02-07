import React from "react";
import { IdType } from "@/types";
import ResumeContext from "@/shared/utils/ResumeContext";
import { useIsNodeSelected, useIsEditingSelected } from "@/shared/stores/editorStore";

export interface ContainerProps {
    id: IdType;
    uuid: string;

    /** Any other HTML attributes that should be set */
    attributes?: Object;

    children?: React.ReactNode;
    className?: string;
    displayAs?: string;
    emptyText?: string; // TODO: Do something
    htmlId?: string;
    style?: React.CSSProperties;
}

/**
 * Generic parent-level container for resume components
 * @param props
 */
export default function Container(props: ContainerProps) {
    const displayAs = props.displayAs || "div";
    let classes = [props.className];
    let ref = React.createRef();
    const isSelected = useIsNodeSelected(props.uuid);
    const isEditingSelected = useIsEditingSelected();

    return (
        <ResumeContext.Consumer>
            {(value) => {
                /** Props for managing selection and focus */
                const selectTriggerProps = {
                    onClick: () => {
                        value.updateClicked(props.id);
                    },

                    onContextMenu: (event: React.MouseEvent) => {
                        if (isEditingSelected) {
                            // If editing, use default context menu
                            // so user can use browser's spellcheck, etc.
                            event.stopPropagation();
                        }
                        else {
                            value.updateClicked(props.id);
                        }
                    }
                }

                let newProps = {
                    ...props.attributes,
                    className: classes.join(' '),
                    style: props.style,
                    id: props.htmlId,
                    'data-uuid': props.uuid,
                    ref: ref,
                    ...selectTriggerProps
                }

                if (isSelected) {
                    newProps['data-selected'] = true;
                }

                if (displayAs !== "img") {
                    newProps['children'] = props.children;
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