import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import PageSize from '@/types/PageSize';

interface EditorState {
    // Selection state
    selectedNodeId: string | undefined;
    isEditingSelected: boolean;

    // UI state
    leftPaneElement: HTMLDivElement | null;
    pageSize: PageSize;
    savedPageSize: PageSize;
    hasUnsavedPageSizeChanges: boolean;

    // Actions
    selectNode: (nodeId: string) => void;
    editNode: (nodeId: string) => void;
    unselectNode: () => void;
    toggleEdit: () => void;
    setLeftPaneElement: (element: HTMLDivElement | null) => void;
    setPageSize: (pageSize: PageSize) => void;
    loadPageSize: (pageSize: PageSize) => void;
    clearPageSizeUnsavedChanges: () => void;
}

export const useEditorStore = create<EditorState>()(
    devtools(
        (set, get) => ({
            // Initial state
            selectedNodeId: undefined,
            isEditingSelected: false,
            leftPaneElement: null,
            pageSize: PageSize.Letter,
            savedPageSize: PageSize.Letter,
            hasUnsavedPageSizeChanges: false,

            // Actions
            selectNode: (nodeId: string) =>
                set({ selectedNodeId: nodeId, isEditingSelected: false }, false, 'selectNode'),

            editNode: (nodeId: string) =>
                set({ selectedNodeId: nodeId, isEditingSelected: true }, false, 'editNode'),

            unselectNode: () =>
                set({ selectedNodeId: undefined, isEditingSelected: false }, false, 'unselectNode'),

            toggleEdit: () =>
                set((state) => ({ isEditingSelected: !state.isEditingSelected }), false, 'toggleEdit'),

            setLeftPaneElement: (element: HTMLDivElement | null) =>
                set((state) => {
                    // Only update if the element reference actually changed
                    if (state.leftPaneElement === element) {
                        return state; // No change, don't trigger update
                    }
                    return { leftPaneElement: element };
                }, false, 'setLeftPaneElement'),

            setPageSize: (pageSize: PageSize) =>
                set((state) => {
                    if (state.pageSize === pageSize) {
                        return state;
                    }
                    return {
                        pageSize,
                        hasUnsavedPageSizeChanges: pageSize !== state.savedPageSize
                    };
                }, false, 'setPageSize'),
            loadPageSize: (pageSize: PageSize) =>
                set({
                    pageSize,
                    savedPageSize: pageSize,
                    hasUnsavedPageSizeChanges: false
                }, false, 'loadPageSize'),
            clearPageSizeUnsavedChanges: () =>
                set((state) => ({
                    savedPageSize: state.pageSize,
                    hasUnsavedPageSizeChanges: false
                }), false, 'clearPageSizeUnsavedChanges'),
        }),
        { name: 'EditorStore' }
    )
);

// Selector hooks for better performance (only re-render when specific values change)
export const useSelectedNodeId = () => useEditorStore((state) => state.selectedNodeId);
export const useIsEditingSelected = () => useEditorStore((state) => state.isEditingSelected);
export const useLeftPaneElement = () => useEditorStore((state) => state.leftPaneElement);
export const usePageSize = () => useEditorStore((state) => state.pageSize);
export const useHasUnsavedPageSizeChanges = () =>
    useEditorStore((state) => state.hasUnsavedPageSizeChanges);
export const useIsNodeSelected = (nodeId: string) => 
    useEditorStore((state) => state.selectedNodeId === nodeId);
export const useIsNodeEditing = (nodeId: string) => 
    useEditorStore((state) => state.selectedNodeId === nodeId && state.isEditingSelected);
