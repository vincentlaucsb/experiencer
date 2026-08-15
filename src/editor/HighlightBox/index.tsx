import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { HighlightBox as HighlightBoxComponent } from './HighlightBox';
import { useEditorStore, useLeftPaneElement } from '@/shared/stores/editorStore';
import { hintStore, isHintKey } from '@/shared/stores/hintStore';

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
    const hintSnapshot = useSyncExternalStore(hintStore.subscribe, hintStore.getSnapshot);
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null);
    
    useEffect(() => {
        if (selectedNodeId) {
            // Find the element with matching data-uuid attribute
            const element = document.querySelector(`[data-uuid="${selectedNodeId}"]`) as HTMLElement;
            setSelectedElement(element);
        } else {
            setSelectedElement(null);
        }
    }, [selectedNodeId]);
    
    // Only render if we have both a selected node and found the element
    if (!selectedNodeId || !selectedElement) {
        return null;
    }

    const hintAttribute = selectedElement.getAttribute("data-selection-hint-key");
    const hintKey = isHintKey(hintAttribute) ? hintAttribute : undefined;
    const selectionHint = !isEditingSelected && hintKey && !hintSnapshot.dismissed[hintKey]
        ? selectedElement.getAttribute("data-selection-hint") ?? undefined
        : undefined;
    
    return (
        <HighlightBoxComponent
            className="resume-hl-box resume-hl-box-selected-node"
            elem={selectedElement}
            leftPaneElement={leftPaneElement}
            selectionHint={selectionHint}
            onDismissSelectionHint={hintKey ? () => hintStore.dismiss(hintKey) : undefined}
        />
    );
}

// Re-export the base component for other use cases (like CssEditor)
export { HighlightBox } from './HighlightBox';
