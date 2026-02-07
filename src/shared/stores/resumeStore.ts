import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import ResumeNodeTree from '@/shared/utils/NodeTree';
import { ResumeNode, IdType } from '@/types';

interface ResumeState {
    // Core data
    tree: ResumeNodeTree;
    
    // UI state
    unsavedChanges: boolean;
    
    // Actions for tree manipulation (UUID-based - preferred)
    addNodeByUuid: (parentUuid: string, node: ResumeNode) => void;
    deleteNodeByUuid: (uuid: string) => void;
    updateNodeByUuid: (uuid: string, key: string, data: any) => void;
    moveNodeUpByUuid: (uuid: string) => string;
    moveNodeDownByUuid: (uuid: string) => string;
    
    // Legacy IdType-based actions (internal use)
    setNodes: (nodes: ResumeNode[]) => void;
    addNode: (parentId: IdType, node: ResumeNode) => void;
    deleteNode: (id: IdType) => void;
    updateNode: (id: IdType, key: string, data: any) => void;
    moveNodeUp: (id: IdType) => IdType;
    moveNodeDown: (id: IdType) => IdType;
    
    // Utility actions
    getNode: (id: IdType) => ResumeNode;
    getNodeByUuid: (uuid: string) => ResumeNode | undefined;
    getParentUuids: (uuid: string) => string[];  // Returns parent UUIDs from bottom to top
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

            // Get node by UUID (read-only operation)
            getNodeByUuid: (uuid: string) => {
                return get().tree.getNodeByUuid(uuid);
            },

            // UUID-based actions (preferred API)
            addNodeByUuid: (parentUuid: string, node: ResumeNode) => {
                const parentId = get().tree.getHierarchicalId(parentUuid);
                if (parentId) {
                    set(
                        (state) => {
                            state.tree.addNestedChild(parentId, node);
                            state.unsavedChanges = true;
                        },
                        false,
                        'addNodeByUuid'
                    );
                }
            },

            deleteNodeByUuid: (uuid: string) => {
                const id = get().tree.getHierarchicalId(uuid);
                if (id) {
                    set(
                        (state) => {
                            state.tree.deleteChild(id);
                            state.unsavedChanges = true;
                        },
                        false,
                        'deleteNodeByUuid'
                    );
                }
            },

            updateNodeByUuid: (uuid: string, key: string, data: any) => {
                const id = get().tree.getHierarchicalId(uuid);
                if (id) {
                    set(
                        (state) => {
                            state.tree.updateChild(id, key, data);
                            state.unsavedChanges = true;
                        },
                        false,
                        'updateNodeByUuid'
                    );
                }
            },

            moveNodeUpByUuid: (uuid: string) => {
                const id = get().tree.getHierarchicalId(uuid);
                if (id) {
                    let newId: IdType = id;
                    set(
                        (state) => {
                            newId = state.tree.moveUp(id);
                            state.unsavedChanges = true;
                        },
                        false,
                        'moveNodeUpByUuid'
                    );
                    const movedNode = get().tree.getNodeById(newId);
                    return movedNode.uuid;
                }
                return uuid;
            },

            moveNodeDownByUuid: (uuid: string) => {
                const id = get().tree.getHierarchicalId(uuid);
                if (id) {
                    let newId: IdType = id;
                    set(
                        (state) => {
                            newId = state.tree.moveDown(id);
                            state.unsavedChanges = true;
                        },
                        false,
                        'moveNodeDownByUuid'
                    );
                    const movedNode = get().tree.getNodeById(newId);
                    return movedNode.uuid;
                }
                return uuid;
            },

            // Get parent UUIDs from bottom to top (for context menu)
            getParentUuids: (uuid: string) => {
                const id = get().tree.getHierarchicalId(uuid);
                if (!id || id.length === 0) return [];
                
                const parentIds: string[] = [];
                const parentId = [...id];
                parentId.pop(); // Remove last element to get parent
                
                while (parentId.length > 0) {
                    const parent = get().tree.getNodeById(parentId);
                    if (parent) {
                        parentIds.push(parent.uuid);
                    }
                    parentId.pop();
                }
                
                return parentIds;
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
export const useResumeNodeByUuid = (uuid: string) =>
    useResumeStore((state) => state.tree.getNodeByUuid(uuid));
