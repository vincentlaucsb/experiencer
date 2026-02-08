import React from "react";
import { isNullOrUndefined } from "@/shared/utils/Helpers";
import { useEditorStore, useIsNodeSelected, useIsNodeEditing } from "@/shared/stores/editorStore";
import { IdType } from "@/types";
import OverlayEditor from "./OverlayEditor";

export interface ContainerProps {
    id: IdType;
    uuid: string;

    /** Any other HTML attributes that should be set */
    attributes?: Object;

    editContent?: React.ReactNode; // Content to show in popover when editing

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
    let elementRef = React.useRef<HTMLElement>(null);
    const isSelected = useIsNodeSelected(props.uuid);
    const isEditingNode = useIsNodeEditing(props.uuid);
    const hasOverlayEdit = !isNullOrUndefined(props.editContent);
    const selectNode = useEditorStore((state) => state.selectNode);
    const editNode = useEditorStore((state) => state.editNode);

    /** Props for managing selection and focus */
    const selectTriggerProps = {
        onClick: (event: React.MouseEvent) => {
            if (isSelected) {
                editNode(props.uuid);
            }
            else {
                selectNode(props.uuid);
            }
            event.stopPropagation();
        },

        onContextMenu: (event: React.MouseEvent) => {
            event.stopPropagation();
            if (!isEditingNode) {
                selectNode(props.uuid);
            }
        }
    }

    let newProps = {
        ...props.attributes,
        className: classes.join(' '),
        style: props.style,
        id: props.htmlId,
        'data-uuid': props.uuid,
        ref: elementRef,
        ...selectTriggerProps
    }

    if (isSelected) {
        newProps['data-selected'] = true;
    }

    if (displayAs !== "img") {
        newProps['children'] = props.children;
    }

    const element = React.createElement(displayAs, newProps);

    return (
        <>
            {element}
            {hasOverlayEdit && (
                <OverlayEditor
                    triggerElement={elementRef.current}
                    isOpen={isEditingNode}
                    className="container-overlay-editor"
                >
                    {props.editContent}
                </OverlayEditor>
            )}
        </>
    );
}
