import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface EditorState {
    // Selection state
    selectedNodeId: string | undefined;
    isEditingSelected: boolean;

    // Actions
    selectNode: (nodeId: string) => void;
    editNode: (nodeId: string) => void;
    unselectNode: () => void;
    toggleEdit: () => void;
}

export const useEditorStore = create<EditorState>()(
    devtools(
        (set) => ({
            // Initial state
            selectedNodeId: undefined,
            isEditingSelected: false,

            // Actions
            selectNode: (nodeId: string) =>
                set({ selectedNodeId: nodeId, isEditingSelected: false }, false, 'selectNode'),

            editNode: (nodeId: string) =>
                set({ selectedNodeId: nodeId, isEditingSelected: true }, false, 'editNode'),

            unselectNode: () =>
                set({ selectedNodeId: undefined, isEditingSelected: false }, false, 'unselectNode'),

            toggleEdit: () =>
                set((state) => ({ isEditingSelected: !state.isEditingSelected }), false, 'toggleEdit'),
        }),
        { name: 'EditorStore' }
    )
);

// Selector hooks for better performance (only re-render when specific values change)
export const useSelectedNodeId = () => useEditorStore((state) => state.selectedNodeId);
export const useIsEditingSelected = () => useEditorStore((state) => state.isEditingSelected);
export const useIsNodeSelected = (nodeId: string) => 
    useEditorStore((state) => state.selectedNodeId === nodeId);
export const useIsNodeEditing = (nodeId: string) => 
    useEditorStore((state) => state.selectedNodeId === nodeId && state.isEditingSelected);
