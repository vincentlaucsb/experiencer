import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { EditorMode } from '@/types';

interface EditorState {
    // Selection state
    selectedNodeId: string | undefined;
    isEditingSelected: boolean;

    // Mode state
    mode: EditorMode;
    
    // UI state
    leftPaneElement: HTMLDivElement | null;

    // Actions
    selectNode: (nodeId: string) => void;
    editNode: (nodeId: string) => void;
    unselectNode: () => void;
    toggleEdit: () => void;
    setMode: (mode: EditorMode) => void;
    toggleMode: (mode: EditorMode) => void;
    setLeftPaneElement: (element: HTMLDivElement | null) => void;
}

export const useEditorStore = create<EditorState>()(
    devtools(
        (set, get) => ({
            // Initial state
            selectedNodeId: undefined,
            isEditingSelected: false,
            mode: 'landing',
            leftPaneElement: null,

            // Actions
            selectNode: (nodeId: string) =>
                set({ selectedNodeId: nodeId, isEditingSelected: false }, false, 'selectNode'),

            editNode: (nodeId: string) =>
                set({ selectedNodeId: nodeId, isEditingSelected: true }, false, 'editNode'),

            unselectNode: () =>
                set({ selectedNodeId: undefined, isEditingSelected: false }, false, 'unselectNode'),

            toggleEdit: () =>
                set((state) => ({ isEditingSelected: !state.isEditingSelected }), false, 'toggleEdit'),

            setMode: (mode: EditorMode) =>
                set({ mode }, false, 'setMode'),

            toggleMode: (mode: EditorMode) => {
                const newMode = get().mode === mode ? 'normal' : mode;
                set({ mode: newMode }, false, 'toggleMode');
            },
            
            setLeftPaneElement: (element: HTMLDivElement | null) =>
                set((state) => {
                    // Only update if the element reference actually changed
                    if (state.leftPaneElement === element) {
                        return state; // No change, don't trigger update
                    }
                    return { leftPaneElement: element };
                }, false, 'setLeftPaneElement'),
        }),
        { name: 'EditorStore' }
    )
);

// Selector hooks for better performance (only re-render when specific values change)
export const useSelectedNodeId = () => useEditorStore((state) => state.selectedNodeId);
export const useIsEditingSelected = () => useEditorStore((state) => state.isEditingSelected);
export const useLeftPaneElement = () => useEditorStore((state) => state.leftPaneElement);
export const useMode = () => useEditorStore((state) => state.mode);
export const useIsEditing = () => useEditorStore((state) => 
    state.mode === 'normal' || state.mode === 'help'
);
export const useIsNodeSelected = (nodeId: string) => 
    useEditorStore((state) => state.selectedNodeId === nodeId);
export const useIsNodeEditing = (nodeId: string) => 
    useEditorStore((state) => state.selectedNodeId === nodeId && state.isEditingSelected);
