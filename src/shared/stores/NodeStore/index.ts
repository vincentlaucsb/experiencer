import ClassStore from '@/shared/ClassStore';
import ResumeNodeTree from '@/shared/NodeTree';
import ComponentTypes from '@/resume/schema/ComponentTypes';
import { showToast } from '@/shared/stores/toastStore';
import { IdType, ResumeNode } from '@/types';

/**
 * Gates resume-tree mutations, undo history, selection cleanup, and user
 * feedback behind one store.
 */
export default class NodeStore extends ClassStore<ResumeNodeTree> {
    protected _data: ResumeNodeTree;
    private historyRecorder: () => void = () => undefined;
    private selectedNodeIdProvider: () => string | undefined = () => undefined;
    private clearSelection: () => void = () => undefined;

    setHistoryRecorder(recorder?: () => void): void {
        this.historyRecorder = recorder ?? (() => undefined);
    }

    setSelectionAdapter(
        selectedNodeIdProvider?: () => string | undefined,
        clearSelection?: () => void
    ): void {
        this.selectedNodeIdProvider = selectedNodeIdProvider ?? (() => undefined);
        this.clearSelection = clearSelection ?? (() => undefined);
    }

    private recordNodeHistory(): void {
        this.historyRecorder();
    }

    private resolvePath(id: string | IdType): IdType | undefined {
        return typeof id === 'string' ? this.data.getHierarchicalId(id) : id;
    }

    private isPrefixPath(prefix: IdType, target: IdType): boolean {
        if (prefix.length > target.length) {
            return false;
        }

        return prefix.every((value, index) => target[index] === value);
    }

    private getParentNode(parentId: string | IdType | undefined): ResumeNode | undefined {
        const normalizedParentId: string | IdType = parentId ?? [];
        return typeof normalizedParentId === 'string'
            ? this.data.getNodeByUuid(normalizedParentId)
            : this.data.getNodeById(normalizedParentId);
    }

    private isAllowedChildType(parentType: string, childType: string): boolean {
        const allowedChildren = ComponentTypes.instance.childTypes(parentType);

        if (Array.isArray(allowedChildren)) {
            return allowedChildren.includes(childType);
        }

        return allowedChildren === childType;
    }

    private getNodeDisplayText(type: string): string {
        try {
            return ComponentTypes.instance.defaultValue(type).text;
        } catch {
            return type;
        }
    }

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
     * Add a node as a nested child using either UUID or hierarchical ID.
     * Pass undefined to add directly under the root node.
     * 
     * @param parentId - UUID, hierarchical ID, or undefined for root insertion
     * @param node - The node to add
     */
    addNode(parentId: string | IdType | undefined, node: ResumeNode): void {
        const normalizedParentId: string | IdType = parentId ?? [];
        const parentNode = this.getParentNode(parentId);

        if (!parentNode) {
            return;
        }

        if (!this.isAllowedChildType(parentNode.type, node.type)) {
            const childText = this.getNodeDisplayText(node.type);
            const parentText = this.getNodeDisplayText(parentNode.type);
            showToast(`${childText} cannot be a child of ${parentText}.`);
            return;
        }

        this.recordNodeHistory();
        this.withMutation(() => this.data.addNestedChild(normalizedParentId, node));
    }

    /**
     * Validate whether a node can be inserted under a parent.
     * Used by callers that need to avoid side effects (e.g., history writes) for invalid inserts.
     */
    canAddNode(parentId: string | IdType | undefined, node: ResumeNode): boolean {
        const parentNode = this.getParentNode(parentId);
        if (!parentNode) {
            return false;
        }

        return this.isAllowedChildType(parentNode.type, node.type);
    }

    /**
     * Delete a node from the tree.
     * Accepts either a UUID string or hierarchical ID.
     * 
     * @param id - UUID or hierarchical ID of the node to delete
     */
    deleteNode(id: string | IdType): void {
        const deletePath = this.resolvePath(id);
        if (!deletePath) {
            return;
        }

        const selectedNodeId = this.selectedNodeIdProvider();
        const selectedPath = selectedNodeId ? this.data.getHierarchicalId(selectedNodeId) : undefined;
        const shouldClearSelection = !!selectedPath && this.isPrefixPath(deletePath, selectedPath);

        this.recordNodeHistory();
        this.withMutation(() => this.data.deleteChild(deletePath));

        if (shouldClearSelection) {
            this.clearSelection();
        }
    }

    /**
     * Update a property on a node.
     * Accepts either a UUID string or hierarchical ID.
     * 
     * @param id - UUID or hierarchical ID of the node
     * @param key - Property name to update
     * @param data - New value for the property
     */
    updateNode(id: string | IdType, key: string, data: any): void {
        this.recordNodeHistory();
        this.withMutation(() => this.data.updateChild(id, key, data));
    }

    /**
     * Update multiple properties on a node in a single history entry.
     * Accepts either a UUID string or hierarchical ID.
     */
    updateNodeFields(id: string | IdType, patch: Partial<Record<string, unknown>>): void {
        const entries = Object.entries(patch).filter(([, value]) => value !== undefined);
        if (entries.length === 0) {
            return;
        }

        this.recordNodeHistory();
        this.withMutation(() => {
            entries.forEach(([key, value]) => {
                this.data.updateChild(id, key, value);
            });
        });
    }

    /**
     * Move a node up in its parent's children array.
     * 
     * @overload moveNodeUp(id: string): string
     * @overload moveNodeUp(id: IdType): IdType
     * 
     * @param id - UUID or hierarchical ID of the node to move
     * @returns The UUID if input was UUID, hierarchical ID if input was IdType
     */
    moveNodeUp(id: string | IdType): string | IdType {
        this.recordNodeHistory();
        return this.withMutation(() => this.data.moveUp(id));
    }

    /**
     * Move a node down in its parent's children array.
     * 
     * @overload moveNodeDown(id: string): string
     * @overload moveNodeDown(id: IdType): IdType
     * 
     * @param id - UUID or hierarchical ID of the node to move
     * @returns The UUID if input was UUID, hierarchical ID if input was IdType
     */
    moveNodeDown(id: string | IdType): string | IdType {
        this.recordNodeHistory();
        return this.withMutation(() => this.data.moveDown(id));
    }

    /** Duplicate a node next to its current sibling position. */
    duplicateNode(id: string | IdType, before: boolean): string | undefined {
        const hierarchicalId = this.resolvePath(id);
        if (!hierarchicalId) {
            return undefined;
        }

        const node = this.data.getNodeById(hierarchicalId);
        this.recordNodeHistory();
        return this.withMutation(() => this.data.insertSibling(hierarchicalId, node, before));
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
