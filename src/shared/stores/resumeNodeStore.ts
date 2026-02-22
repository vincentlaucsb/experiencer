import { useSyncExternalStore } from 'react';
import NodeStore from '@/shared/stores/NodeStore';
import ResumeNodeTree from '@/shared/NodeTree';
import { IdType, ResumeNode } from '@/types';

// Singleton instance of the resume node store
export const resumeNodeStore = new NodeStore();

/**
 * Hook to access the entire resume tree.
 * Re-renders when any tree mutation occurs.
 */
export const useResumeTree = (): ResumeNodeTree => {
    const snapshot = useSyncExternalStore(
        resumeNodeStore.subscribe,
        resumeNodeStore.getSnapshot
    );
    return snapshot.data;
};

/**
 * Hook to access just the root-level nodes.
 * Re-renders when tree structure changes.
 */
export const useResumeNodes = (): ResumeNode[] => {
    const tree = useResumeTree();
    return tree.childNodes;
};

/**
 * Hook to check if there are unsaved changes.
 */
export const useHasUnsavedChanges = (): boolean => {
    // Force re-render on any store change, then check flag
    useSyncExternalStore(
        resumeNodeStore.subscribe,
        resumeNodeStore.getSnapshot
    );
    return resumeNodeStore.hasUnsavedChanges();
};

/**
 * Hook to get a specific node by hierarchical ID.
 * Re-renders when tree changes (note: not optimized for single node).
 * 
 * @param id - Hierarchical ID of the node
 */
export const useResumeNode = (id: IdType): ResumeNode => {
    const tree = useResumeTree();
    return tree.getNodeById(id);
};

/**
 * Hook to get a specific node by UUID.
 * Re-renders when tree changes (note: not optimized for single node).
 * 
 * @param uuid - UUID of the node
 */
export const useResumeNodeByUuid = (uuid: string): ResumeNode | undefined => {
    const tree = useResumeTree();
    return tree.getNodeByUuid(uuid);
};

/**
 * Hook that returns the store actions.
 * These are stable references that don't cause re-renders.
 */
export const useResumeActions = () => {
    return {
        // Tree manipulation (accepts UUID or hierarchical ID)
        setNodes: (nodes: ResumeNode[]) => resumeNodeStore.setNodes(nodes),
        addNode: (parentId: string | IdType, node: ResumeNode) => resumeNodeStore.addNode(parentId, node),
        deleteNode: (id: string | IdType) => resumeNodeStore.deleteNode(id),
        updateNode: (id: string | IdType, key: string, data: any) => resumeNodeStore.updateNode(id, key, data),
        moveNodeUp: (id: string | IdType) => resumeNodeStore.moveNodeUp(id),
        moveNodeDown: (id: string | IdType) => resumeNodeStore.moveNodeDown(id),
        
        // Utility
        getNode: (id: IdType) => resumeNodeStore.getNode(id),
        getNodeByUuid: (uuid: string) => resumeNodeStore.getNodeByUuid(uuid),
        getParentUuids: (uuid: string) => resumeNodeStore.getParentUuids(uuid),
        clearUnsavedChanges: () => resumeNodeStore.clearUnsavedChanges(),
    };
};
