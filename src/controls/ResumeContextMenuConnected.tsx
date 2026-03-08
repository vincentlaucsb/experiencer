import React from "react";
import ReactDOM from "react-dom";

// Utilities
import { createContainer } from "@/shared/utils/Helpers";
import contextMenuOptions from "@/resume/schema/ContextMenuOptions";
import ComponentTypes from "@/resume/schema/ComponentTypes";

// Components
import { ContextMenu, MenuItem } from "@/controls/ContextMenu";
import Section from "@/resume/Section";

// Stores
import { useEditorStore } from "@/shared/stores/editorStore";
import { resumeNodeStore, useResumeTree } from "@/shared/stores/resumeNodeStore";

/**
 * Connected Context Menu for Resume nodes
 * 
 * Renders a context menu with:
 * - Node type header
 * - Parent selection options
 * - Edit option (if node is editable)
 * - Custom options from the node's schema
 * 
 * Automatically connects to stores to track the selected node.
 * The Container component triggers this menu with right-click; this
 * component provides the menu content.
 */
export function ResumeContextMenuConnected() {
    const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
    const editNode = useEditorStore((state) => state.editNode);
    const selectNode = useEditorStore((state) => state.selectNode);
    const tree = useResumeTree();
    
    const getNodeByUuid = (uuid: string) => tree.getNodeByUuid(uuid);
    const getParentUuids = (uuid: string) => resumeNodeStore.getParentUuids(uuid);
    const updateNode = (uuid: string, key: string, data: any) => resumeNodeStore.updateNode(uuid, key, data);

    let header = <></>;
    let menu = <></>;
    let editOption = <></>;
    let customOptions: React.ReactNode = <></>;
    let isEditable = false;

    if (selectedNodeId) {
        const currentNode = getNodeByUuid(selectedNodeId);

        if (currentNode) {
            // Header with node type
            header = <h3>{currentNode.type}</h3>;

            // Parent selection options
            const parentUuids = getParentUuids(selectedNodeId);
            menu = (
                <>
                    {parentUuids.map((uuid) => {
                        const parentNode = getNodeByUuid(uuid);
                        if (!parentNode) return null;

                        let text = "";
                        if (parentNode.type === Section.type) {
                            text = `${parentNode.type}: ${parentNode.value}`;
                        } else {
                            text = parentNode.type;
                        }

                        return (
                            <MenuItem
                                key={parentNode.uuid}
                                onClick={() => selectNode(uuid)}
                            >
                                Select {text}
                            </MenuItem>
                        );
                    })}
                </>
            );

            // Check if node is editable via schema registry
            isEditable = ComponentTypes.instance.isEditable(currentNode.type);
            if (isEditable) {
                editOption = (
                    <MenuItem onClick={() => editNode(selectedNodeId)}>
                        Edit
                    </MenuItem>
                );
            }

            // Custom options from schema
            const rawCustomOptions = contextMenuOptions(
                currentNode,
                (key: string, data: any) => {
                    updateNode(selectedNodeId, key, data);
                }
            );
            if (rawCustomOptions) {
                customOptions = rawCustomOptions.map((option, idx) => (
                    <MenuItem key={idx} onClick={option.onClick}>
                        {option.text}
                    </MenuItem>
                ));
            }
        }
    }

    const additionalOptions = (
        <>
            {editOption}
            {customOptions}
        </>
    );

    const hrule = isEditable ? <hr /> : <></>;

    const contextMenuContainer = createContainer("context-menu-container");
    return ReactDOM.createPortal(
        <ContextMenu id="resume-menu">
            {header}
            {menu}
            {hrule}
            {additionalOptions}
        </ContextMenu>,
        contextMenuContainer
    );
}

export default ResumeContextMenuConnected;
