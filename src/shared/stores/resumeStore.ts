import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import ResumeNodeTree from '@/shared/utils/NodeTree';
import { ResumeNode, IdType } from '@/shared/utils/Types';

interface ResumeState {
    // Core data
    tree: ResumeNodeTree;
    
    // UI state
    unsavedChanges: boolean;
    
    // Actions for tree manipulation
    setNodes: (nodes: ResumeNode[]) => void;
    addNode: (parentId: IdType, node: ResumeNode) => void;
    deleteNode: (id: IdType) => void;
    updateNode: (id: IdType, key: string, data: any) => void;
    moveNodeUp: (id: IdType) => IdType;
    moveNodeDown: (id: IdType) => IdType;
    
    // Utility actions
    getNode: (id: IdType) => ResumeNode;
    clearUnsavedChanges: () => void;
}

export const useResumeStore = create<ResumeState>()(
    devtools(
        immer((set, get) => ({
            // Initial state
            tree: new ResumeNodeTree(),
            unsavedChanges: false,

            // Set entire tree (for loading templates/files)
            setNodes: (nodes: ResumeNode[]) =>
                set(
                    (state) => {
                        state.tree = new ResumeNodeTree(nodes);
                        state.unsavedChanges = true;
                    },
                    false,
                    'setNodes'
                ),

            // Add a child node to a parent
            addNode: (parentId: IdType, node: ResumeNode) =>
                set(
                    (state) => {
                        // Immer allows us to "mutate" - it handles immutability
                        state.tree.addNestedChild(parentId, node);
                        state.unsavedChanges = true;
                    },
                    false,
                    'addNode'
                ),

            // Delete a node by ID
            deleteNode: (id: IdType) =>
                set(
                    (state) => {
                        state.tree.deleteChild(id);
                        state.unsavedChanges = true;
                    },
                    false,
                    'deleteNode'
                ),

            // Update a specific property of a node
            updateNode: (id: IdType, key: string, data: any) =>
                set(
                    (state) => {
                        state.tree.updateChild(id, key, data);
                        state.unsavedChanges = true;
                    },
                    false,
                    'updateNode'
                ),

            // Move node up in sibling order
            moveNodeUp: (id: IdType) => {
                let newId: IdType = id;
                set(
                    (state) => {
                        newId = state.tree.moveUp(id);
                        state.unsavedChanges = true;
                    },
                    false,
                    'moveNodeUp'
                );
                return newId;
            },

            // Move node down in sibling order
            moveNodeDown: (id: IdType) => {
                let newId: IdType = id;
                set(
                    (state) => {
                        newId = state.tree.moveDown(id);
                        state.unsavedChanges = true;
                    },
                    false,
                    'moveNodeDown'
                );
                return newId;
            },

            // Get node by ID (read-only operation, no state change)
            getNode: (id: IdType) => {
                return get().tree.getNodeById(id);
            },

            // Clear unsaved changes flag (after save)
            clearUnsavedChanges: () =>
                set({ unsavedChanges: false }, false, 'clearUnsavedChanges'),
        })),
        { name: 'ResumeStore' }
    )
);

// Selector hooks for performance optimization
export const useResumeTree = () => useResumeStore((state) => state.tree);
export const useResumeNodes = () => useResumeStore((state) => state.tree.childNodes);
export const useHasUnsavedChanges = () => useResumeStore((state) => state.unsavedChanges);
export const useResumeNode = (id: IdType) => 
    useResumeStore((state) => state.tree.getNodeById(id));
