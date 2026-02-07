import React, { useRef, useEffect, useState } from 'react';
import SplitPane from 'react-split-pane';
import { HighlightBox as HighlightBoxComponent } from './HighlightBox';
import { useEditorStore } from '@/shared/stores/editorStore';

interface SelectedNodeHighlightBoxProps {
    /** Ref for the vertical split pane */
    verticalSplitRef: React.RefObject<SplitPane>;
}

/**
 * Wrapper component that connects HighlightBox to Zustand stores.
 * Automatically shows/hides the highlight box based on selected node state.
 * Finds the selected element in the DOM using data-uuid attribute.
 */
export function SelectedNodeHighlightBox({ verticalSplitRef }: SelectedNodeHighlightBoxProps) {
    // Subscribe to selected node changes
    const selectedNodeId = useEditorStore(state => state.selectedNodeId);
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
    
    return (
        <HighlightBoxComponent
            className="resume-hl-box resume-hl-box-selected-node"
            elem={selectedElement}
            verticalSplitRef={verticalSplitRef}
        />
    );
}

// Re-export the base component for other use cases (like CssEditor)
export { HighlightBox } from './HighlightBox';
