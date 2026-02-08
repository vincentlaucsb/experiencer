import React from "react";

// Utilities
import { isNullOrUndefined } from "@/shared/utils/Helpers";

// Components
import { ContextMenuTrigger } from "@/controls/ContextMenu";
import OverlayEditor from "./OverlayEditor";

// Stores
import { useEditorStore, useIsNodeEditing, useIsNodeSelected } from "@/shared/stores/editorStore";

// Types
import { IdType } from "@/types";

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

export interface ContainerPresentationProps extends ContainerProps {
    /** Selection and editing state */
    isSelected: boolean;
    isEditing: boolean;

    /** Callbacks */
    onSelect: (uuid: string) => void;
    onEdit: (uuid: string) => void;
    onContextMenuOpen: (uuid: string) => void;
}

/**
 * Presentational component for Container logic.
 * 
 * Pure component that receives all state and callbacks as props.
 * Handles the core interaction patterns for all resume nodes:
 * - Single click: Select the node
 * - Double click (when selected): Enter edit mode
 * - Right click: Open context menu (suppressed while editing)
 * - Overlay editor positioning when in edit mode
 * 
 * All logic is deterministic based on props - no store dependencies.
 * Used directly in tests, wrapped with store logic in production.
 * 
 * This separation of "what should happen" (presentation) from "how to connect 
 * to state" (wrapper) keeps this component easy to understand and test.
 */
export function ContainerPresentation(props: ContainerPresentationProps) {
    const displayAs = props.displayAs || "div";
    let classes = [props.className];
    let elementRef = React.useRef<HTMLElement>(null);
    const hasOverlayEdit = !isNullOrUndefined(props.editContent);

    /** Props for managing selection and focus */
    const selectTriggerProps = {
        onClick: (event: React.MouseEvent) => {
            if (props.isSelected) {
                props.onEdit(props.uuid);
            }
            else {
                props.onSelect(props.uuid);
            }
            event.stopPropagation();
        }
    }

    const handleContextMenu = (event: React.MouseEvent) => {
        event.stopPropagation();

        // Only open context menu if not currently editing
        if (!props.isEditing) {
            props.onContextMenuOpen(props.uuid);
        }
    };

    let newProps = {
        ...props.attributes,
        className: classes.join(' '),
        style: props.style,
        id: props.htmlId,
        'data-uuid': props.uuid,
        ref: elementRef,
        ...selectTriggerProps
    }

    if (props.isSelected) {
        newProps['data-selected'] = true;
    }

    const element = (
        <ContextMenuTrigger
            id="resume-menu"
            renderTag={displayAs}
            attributes={newProps}
            onContextMenu={handleContextMenu}
            disabled={props.isEditing}
        >
            {displayAs === "img" ? undefined : props.children}
        </ContextMenuTrigger>
    );

    return (
        <>
            {element}
            {hasOverlayEdit && (
                <OverlayEditor
                    triggerElement={elementRef.current}
                    isOpen={props.isEditing}
                    className="container-overlay-editor"
                >
                    {props.editContent}
                </OverlayEditor>
            )}
        </>
    );
}

/**
 * Connected Container component that hooks into Zustand stores.
 * 
 * Wraps ContainerPresentation with store logic, implementing the "container" pattern:
 * This component bridges the gap between the resume node tree and React's component tree,
 * making every resume node interactive (selectable, editable, etc.) without requiring
 * each component to manage these concerns individually.
 * 
 * By centralizing node interaction logic here, we avoid duplicating selection/editing code
 * across Header, Entry, Section, Grid, Row, Column, etc. This is React composition at work:
 * a single wrapper component providing cross-cutting concerns to all descendants.
 * 
 * The "several responsibilities" (click handling, double-click editing, context menu, overlay)
 * are unified by a single domain: "what does it mean for a resume node to be interactive?"
 * They necessarily go together - you can't have editing without selection, can't have context
 * menus without selection, etc. This isn't SRP violation; it's proper domain grouping.
 */
export default function Container(props: ContainerProps) {
    const isSelected = useIsNodeSelected(props.uuid);
    const isEditingNode = useIsNodeEditing(props.uuid);
    const selectNode = useEditorStore((state) => state.selectNode);
    const editNode = useEditorStore((state) => state.editNode);

    return (
        <ContainerPresentation
            {...props}
            isSelected={isSelected}
            isEditing={isEditingNode}
            onSelect={selectNode}
            onEdit={editNode}
            onContextMenuOpen={selectNode}
        />
    );
}
