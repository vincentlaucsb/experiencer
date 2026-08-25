import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { DropdownMenu } from '@popright/react';

import { HighlightBox as HighlightBoxComponent } from './HighlightBox';
import { Button } from '@/controls/Buttons';
import buildContextMenuItems, { getNodeLabel } from '@/resume/schema/buildContextMenuItems';
import { useEditorStore, useLeftPaneElement } from '@/shared/stores/editorStore';
import { HintKey, hintStore } from '@/shared/stores/hintStore';
import { useResumeTree } from '@/shared/stores/resumeNodeStore';

/**
 * Wrapper component that connects HighlightBox to Zustand stores.
 * Automatically shows/hides the highlight box based on selected node state.
 * Finds the selected element in the DOM using data-uuid attribute.
 */
export function SelectedNodeHighlightBox() {
    const leftPaneElement = useLeftPaneElement();
    // Subscribe to selected node changes
    const selectedNodeId = useEditorStore(state => state.selectedNodeId);
    const isEditingSelected = useEditorStore(state => state.isEditingSelected);
    const selectNode = useEditorStore(state => state.selectNode);
    const editNode = useEditorStore(state => state.editNode);
    const resumeTree = useResumeTree();
    const hintSnapshot = useSyncExternalStore(hintStore.subscribe, hintStore.getSnapshot);
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const menuId = `selected-node-options-${React.useId().replace(/:/g, "")}`;
    
    useEffect(() => {
        setMenuOpen(false);
        if (selectedNodeId) {
            // Find the element with matching data-uuid attribute
            const element = document.querySelector(`[data-uuid="${selectedNodeId}"]`) as HTMLElement;
            setSelectedElement(element);
        } else {
            setSelectedElement(null);
        }
    }, [selectedNodeId]);
    
    const selectedNode = selectedNodeId ? resumeTree.getNodeByUuid(selectedNodeId) : undefined;
    const contextMenuItems = selectedNodeId
        ? buildContextMenuItems(selectedNodeId, { selectNode, editNode })
        : [];

    // Selection changes can precede the DOM lookup effect by one render. Never
    // attach the new node's actions to the previous node's highlight box.
    if (!selectedNodeId
        || !selectedNode
        || !selectedElement
        || selectedElement.dataset.uuid !== selectedNodeId) {
        return null;
    }

    const selectionHint = !isEditingSelected && !hintSnapshot.dismissed[HintKey.NodeOptions]
        ? "Tip: use the node menu or right-click the selected node for more options."
        : undefined;
    const nodeLabel = getNodeLabel(selectedNode.type);
    
    return (
        <HighlightBoxComponent
            className="resume-hl-box resume-hl-box-selected-node"
            elem={selectedElement}
            leftPaneElement={leftPaneElement}
            selectionHint={selectionHint}
            onDismissSelectionHint={() => hintStore.dismiss(HintKey.NodeOptions)}
        >
            <DropdownMenu
                id={menuId}
                items={contextMenuItems}
                side="bottom"
                align="end"
                onOpen={() => {
                    setMenuOpen(true);
                    hintStore.dismiss(HintKey.NodeOptions);
                }}
                onClose={() => setMenuOpen(false)}
            >
                <Button
                    type="button"
                    className="selected-node-options-trigger no-print"
                    aria-label={`More options for ${nodeLabel}`}
                    title={`More options for ${nodeLabel}`}
                    aria-haspopup="menu"
                    aria-controls={menuId}
                    aria-expanded={menuOpen}
                    data-selected-node-options-trigger=""
                    onMouseDown={(event) => event.stopPropagation()}
                    onClick={(event) => event.stopPropagation()}
                >
                    <span aria-hidden="true">&#8942;</span>
                </Button>
            </DropdownMenu>
        </HighlightBoxComponent>
    );
}

// Re-export the base component for other use cases (like CssEditor)
export { HighlightBox } from './HighlightBox';
