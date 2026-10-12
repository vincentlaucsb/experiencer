import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import PageSize from '@/types/PageSize';
import type { CssRuleTarget } from '@/shared/utils/cssRuleInspection';

interface EditorState {
    // Selection state
    selectedNodeId: string | undefined;
    isEditingSelected: boolean;
    selectionEnabled: boolean;

    cssRuleTarget: CssRuleTarget | undefined;
    activeSidebarTab: string;
    inspectCssRule: (target: CssRuleTarget) => void;
    setActiveSidebarTab: (key: string) => void;

    // UI state
    leftPaneElement: HTMLDivElement | null;
    pageSize: PageSize;
    savedPageSize: PageSize;
    hasUnsavedPageSizeChanges: boolean;

    // Actions
    selectNode: (nodeId: string) => void;
    editNode: (nodeId: string) => void;
    unselectNode: () => void;
    setSelectionEnabled: (enabled: boolean) => void;
    toggleEdit: () => void;
    setLeftPaneElement: (element: HTMLDivElement | null) => void;
    setPageSize: (pageSize: PageSize) => void;
    loadPageSize: (pageSize: PageSize) => void;
    clearPageSizeUnsavedChanges: () => void;
}

export const useEditorStore = create<EditorState>()(
    devtools(
        (set, get) => ({
            // Inspector focus is transient and selection commands always retire it.
            cssRuleTarget: undefined,
            activeSidebarTab: 'Tree',
            inspectCssRule: target => set({ cssRuleTarget: target, activeSidebarTab: 'CSS' }, false, 'inspectCssRule'),
            setActiveSidebarTab: key => set({ activeSidebarTab: key }, false, 'setActiveSidebarTab'),
            // Initial state
            selectedNodeId: undefined,
            isEditingSelected: false,
            selectionEnabled: true,
            leftPaneElement: null,
            pageSize: PageSize.Letter,
            savedPageSize: PageSize.Letter,
            hasUnsavedPageSizeChanges: false,

            // Actions
            selectNode: (nodeId: string) =>
                set((state) => state.selectionEnabled
                    ? { selectedNodeId: nodeId, isEditingSelected: false, cssRuleTarget: undefined }
                    : state, false, 'selectNode'),

            editNode: (nodeId: string) =>
                set((state) => state.selectionEnabled
                    ? { selectedNodeId: nodeId, isEditingSelected: true, cssRuleTarget: undefined }
                    : state, false, 'editNode'),

            unselectNode: () =>
                set({ selectedNodeId: undefined, isEditingSelected: false, cssRuleTarget: undefined }, false, 'unselectNode'),

            setSelectionEnabled: (enabled: boolean) =>
                set((state) => {
                    if (state.selectionEnabled === enabled && enabled) {
                        return state;
                    }

                    return enabled
                        ? { selectionEnabled: true }
                        : {
                            selectionEnabled: false,
                            cssRuleTarget: undefined,
                            selectedNodeId: undefined,
                            isEditingSelected: false
                        };
                }, false, 'setSelectionEnabled'),

            toggleEdit: () =>
                set((state) => state.selectionEnabled
                    ? { isEditingSelected: !state.isEditingSelected }
                    : state, false, 'toggleEdit'),

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
    useEditorStore((state) => state.selectionEnabled && state.selectedNodeId === nodeId);
export const useIsNodeEditing = (nodeId: string) => 
    useEditorStore((state) =>
        state.selectionEnabled && state.selectedNodeId === nodeId && state.isEditingSelected
    );
