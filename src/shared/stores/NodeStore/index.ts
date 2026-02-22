import ClassStore from '@/shared/ClassStore';
import ResumeNodeTree from '@/shared/NodeTree';
import { IdType, ResumeNode } from '@/types';

/**
 * Store wrapper for ResumeNodeTree that integrates with React's useSyncExternalStore.
 * 
 * Separates tree operations (NodeTree) from store/subscription concerns (ClassStore).
 * All mutation methods modify the tree in place and notify React subscribers.
 */
export default class NodeStore extends ClassStore<ResumeNodeTree> {
    protected _data: ResumeNodeTree;

    constructor(initialTree?: ResumeNodeTree) {
        super();
        this._data = initialTree || new ResumeNodeTree();
    }

    // #region Tree Manipulation (IdType-based)

    /**
     * Replace the entire tree with a new one (for loading templates/files).
     * 
     * @param nodes - Array of root-level nodes
     */
    setNodes(nodes: ResumeNode[]): void {
        this.withMutation(() => {
            this.data = new ResumeNodeTree(nodes);
        });
    }

    /**
     * Add a node as a nested child to a parent node.
     * 
     * @param parentId - Hierarchical ID of the parent node
     * @param node - The node to add
     */
    addNode(parentId: IdType, node: ResumeNode): void {
        this.withMutation(() => this.data.addNestedChild(parentId, node));
    }

    /**
     * Delete a node from the tree.
     * 
     * @param id - Hierarchical ID of the node to delete
     */
    deleteNode(id: IdType): void {
        this.withMutation(() => this.data.deleteChild(id));
    }

    /**
     * Update a property on a node.
     * 
     * @param id - Hierarchical ID of the node
     * @param key - Property name to update
     * @param data - New value for the property
     */
    updateNode(id: IdType, key: string, data: any): void {
        this.withMutation(() => this.data.updateChild(id, key, data));
    }

    /**
     * Move a node up in its parent's children array.
     * 
     * @param id - Hierarchical ID of the node to move
     * @returns The new hierarchical ID after moving
     */
    moveNodeUp(id: IdType): IdType {
        return this.withMutation(() => this.data.moveUp(id));
    }

    /**
     * Move a node down in its parent's children array.
     * 
     * @param id - Hierarchical ID of the node to move
     * @returns The new hierarchical ID after moving
     */
    moveNodeDown(id: IdType): IdType {
        return this.withMutation(() => this.data.moveDown(id));
    }

    // #endregion

    // #region Tree Manipulation (UUID-based - Preferred API)

    /**
     * Add a node as a nested child using parent UUID.
     * 
     * @param parentUuid - UUID of the parent node
     * @param node - The node to add
     */
    addNodeByUuid(parentUuid: string, node: ResumeNode): void {
        const parentId = this.data.getHierarchicalId(parentUuid);
        if (parentId) {
            this.addNode(parentId, node);
        }
    }

    /**
     * Delete a node by UUID.
     * 
     * @param uuid - UUID of the node to delete
     */
    deleteNodeByUuid(uuid: string): void {
        const id = this.data.getHierarchicalId(uuid);
        if (id) {
            this.deleteNode(id);
        }
    }

    /**
     * Update a node property by UUID.
     * 
     * @param uuid - UUID of the node
     * @param key - Property name to update
     * @param data - New value for the property
     */
    updateNodeByUuid(uuid: string, key: string, data: any): void {
        const id = this.data.getHierarchicalId(uuid);
        if (id) {
            this.updateNode(id, key, data);
        }
    }

    /**
     * Move a node up by UUID.
     * 
     * @param uuid - UUID of the node to move
     * @returns UUID of the node after moving (same UUID, new position)
     */
    moveNodeUpByUuid(uuid: string): string {
        const id = this.data.getHierarchicalId(uuid);
        if (id) {
            this.moveNodeUp(id);
        }
        return uuid;
    }

    /**
     * Move a node down by UUID.
     * 
     * @param uuid - UUID of the node to move
     * @returns UUID of the node after moving (same UUID, new position)
     */
    moveNodeDownByUuid(uuid: string): string {
        const id = this.data.getHierarchicalId(uuid);
        if (id) {
            this.moveNodeDown(id);
        }
        return uuid;
    }

    // #endregion

    // #region Read-Only Operations

    /**
     * Get a node by hierarchical ID.
     * 
     * @param id - Hierarchical ID of the node
     * @returns The node at that path
     */
    getNode(id: IdType): ResumeNode {
        return this.data.getNodeById(id);
    }

    /**
     * Get a node by UUID.
     * 
     * @param uuid - UUID of the node
     * @returns The node if found, undefined otherwise
     */
    getNodeByUuid(uuid: string): ResumeNode | undefined {
        return this.data.getNodeByUuid(uuid);
    }

    /**
     * Get parent UUIDs from bottom to top.
     * Useful for building breadcrumb trails or context menus.
     * 
     * @param uuid - UUID of the child node
     * @returns Array of parent UUIDs from immediate parent to root
     */
    getParentUuids(uuid: string): string[] {
        const id = this.data.getHierarchicalId(uuid);
        if (!id || id.length === 0) return [];

        const parentIds: string[] = [];
        const parentId = [...id];
        parentId.pop(); // Remove last element to get parent

        while (parentId.length > 0) {
            const parent = this.data.getNodeById(parentId);
            if (parent) {
                parentIds.push(parent.uuid);
            }
            parentId.pop();
        }

        return parentIds;
    }

    // #endregion
}
