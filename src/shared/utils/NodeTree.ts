import { deleteAt, moveUp, moveDown } from "@/shared/utils/arrayHelpers";
import { assignIds, deepCopy } from "@/shared/utils/Helpers";
import { IdType, ResumeNode } from "@/types";

export default class ResumeNodeTree implements ResumeNode {
    /** A mapping of node UUIDs to hierarchal IDs */
    private _uuidIndex = new Map<string, IdType>();

    childNodes = new Array<ResumeNode>();
    type = 'Resume';
    uuid = '';
    htmlId = '';

    constructor(children = new Array<ResumeNode>()) {
        this.childNodes = children;
        this.rebuildIndex();
    }

    // #region Index Management (Private Helpers)

    /**
     * Rebuild the UUID index by recursively scanning the tree.
     * Clears and rebuilds the entire index or targeted subtree.
     * 
     * @param node - Optional node to start rebuild from. If omitted, entire tree is indexed.
     * @param parentPath - The hierarchical path to `node` (required when node is provided)
     */
    private rebuildIndex(node?: ResumeNode, parentPath?: IdType) {
        const recurse = (currentNode: ResumeNode, currentPath: IdType) => {
            this._uuidIndex.set(currentNode.uuid, currentPath);
            if (currentNode.childNodes && currentNode.childNodes.length > 0) {
                currentNode.childNodes.forEach((child, index) => {
                    recurse(child, [...currentPath, index]);
                });
            }
        };

        if (node && parentPath !== undefined) {
            // Rebuild just this subtree
            recurse(node, parentPath);
        } else {
            // Rebuild entire tree
            this._uuidIndex.clear();
            this.childNodes.forEach((child, index) => {
                recurse(child, [index]);
            });
        }
    }

    /**
     * Add a node and all its descendants to the UUID index.
     * Used when inserting new nodes into the tree.
     * 
     * @param node - The node to index (and its descendants)
     * @param path - The hierarchical path to this node
     */
    private addToIndex(node: ResumeNode, path: IdType) {
        this._uuidIndex.set(node.uuid, path);
        if (node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach((child, index) => {
                this.addToIndex(child, [...path, index]);
            });
        }
    }

    /**
     * Remove a node and all its descendants from the UUID index.
     * Used when deleting nodes from the tree.
     * 
     * @param node - The node to remove from index (and its descendants)
     */
    private removeFromIndex(node: ResumeNode) {
        this._uuidIndex.delete(node.uuid);
        if (node.childNodes && node.childNodes.length > 0) {
            node.childNodes.forEach(child => {
                this.removeFromIndex(child);
            });
        }
    }

    /**
     * Navigate the tree using a hierarchical ID and return both target and parent nodes.
     * Helper method for tree traversal operations.
     * 
     * @param id - The hierarchical path [index1, index2, ...]
     * @returns A tuple of [targetNode, parentNode] at that path
     * @throws Error if traversal path is invalid (parent has no children)
     */
    private traverse(id: IdType) {
        let targetNode: ResumeNode = this.childNodes[id[0]],
            parentNode: ResumeNode = this;

        for (let i = 1; i < id.length; i++) {
            if (i + 1 === id.length) {
                parentNode = targetNode;
            }

            if (targetNode.childNodes) {
                targetNode = targetNode.childNodes[id[i]];
            }
            else {
                throw new Error("Parent has no children");
            }
        }

        return [targetNode, parentNode];
    }

    // #endregion

    // #region Node Searching/Retrieval

    /**
     * Get the hierarchical ID (path) for a node by its UUID.
     * Returns undefined if the UUID is not found in the tree.
     * 
     * @param uuid - The UUID of the node to find
     * @returns The hierarchical ID [index1, index2, ...] or undefined
     */
    getHierarchicalId(uuid: string) {
        const id = this._uuidIndex.get(uuid);

        if (id) {
            return id;
        }
    }

    /**
     * Get a node by its hierarchical ID (path).
     * 
     * @param id - The hierarchical path [index1, index2, ...]
     * @returns The node at that path
     * @throws Error if id is empty or traversal fails
     */
    getNodeById(id: IdType): ResumeNode {
        if (id.length === 0) {
            throw new Error("Cannot get node with empty hierarchical ID");
        }

        return this.traverse(id)[0];
    }

    /**
     * Get a node by its UUID.
     * Looks up the UUID in the index and retrieves the node.
     * 
     * @param uuid - The UUID of the node to find
     * @returns The node if found, undefined otherwise
     */
    getNodeByUuid(uuid: string): ResumeNode | undefined {
        const id = this._uuidIndex.get(uuid);
        if (id) {
            return this.getNodeById(id);
        }
    }

    /**
     * Get the parent node of a node identified by hierarchical ID.
     * 
     * @param id - The hierarchical path to the child node
     * @returns The parent node
     * @throws Error if traversal fails
     */
    getParentOfId(id: IdType) {
        return this.traverse(id)[1];
    }

    /**
     * Check if a node is the last sibling in its parent's children array.
     * Useful for layout decisions (e.g., border rendering).
     * 
     * @param id - The hierarchical path to the node
     * @returns true if this is the last child, false otherwise
     * @throws Error if parent has no children
     */
    isLastSibling(id: IdType) {
        let parentNode = this.getParentOfId(id);
        const position = id[id.length - 1];

        if (parentNode.childNodes) {
            return position + 1 === parentNode.childNodes.length;
        }

        throw new Error("Parent has no children");
    }

    // #endregion

    // #region Tree Modification

    /**
     * Add a child node to the root of the tree.
     * The node is appended to the end of the root's children.
     * 
     * @param node - The node to add
     */
    addChild(node: ResumeNode) {
        this.childNodes.push(node);
        const path = [this.childNodes.length - 1];
        this.addToIndex(node, path);
    }

    /**
     * Add a node as a nested child to an existing node.
     * Creates the childNodes array if it doesn't exist.
     * A deep copy of the node is created to preserve the original.
     * 
     * @param id - Hierarchical ID of the parent node
     * @param node - The node to add as a child
     */
    addNestedChild(id: IdType, node: ResumeNode) {
        let targetNode = this.getNodeById(id);
        if (!targetNode.childNodes) {
            targetNode.childNodes = new Array<ResumeNode>();
        }

        const newNode = assignIds(deepCopy(node));
        targetNode.childNodes.push(newNode);
        const path = [...id, targetNode.childNodes.length - 1];
        this.addToIndex(newNode, path);
    }

    /**
     * Delete a child node from the tree.
     * Also removes all descendants and updates indices.
     * 
     * @param id - Hierarchical ID of the node to delete
     * @throws Error if parent has no children
     */
    deleteChild(id: IdType) {
        let parentNode = this.getParentOfId(id);

        if (parentNode.childNodes) {
            const childElem = parentNode.childNodes[id[id.length - 1]];
            this.removeFromIndex(childElem);
            deleteAt(parentNode.childNodes, id[id.length - 1]);
            // Rebuild index only for parent's children (siblings shifted positions)
            const parentPath = id.slice(0, -1);
            if (parentPath.length === 0) {
                // Parent is root, rebuild entire tree
                this.rebuildIndex();
            } else {
                // Rebuild parent's subtree
                this.rebuildIndex(parentNode, parentPath);
            }
        }
    }

    /**
     * Update a property value on a node.
     * 
     * @param id - Hierarchical ID of the node to update
     * @param key - The property name to update
     * @param data - The new value for the property
     */
    updateChild(id: IdType, key: string, data: any) {
        let targetNode = this.getNodeById(id);
        targetNode[key] = data;
    }
    
    /**
     * Move a node up one position in its parent's children array.
     * Swaps the node with its preceding sibling.
     * 
     * @param id - Hierarchical ID of the node to move
     * @returns The new hierarchical ID of the node after the move
     * @throws Error if node is already first or parent has no children
     */
    moveUp(id: IdType) {
        let parentNode = this.getParentOfId(id);

        if (!parentNode.childNodes) {
            throw new Error("Parent has no children");
        }

        moveUp(parentNode.childNodes, id[id.length - 1]);

        const newId = [
            ...id.slice(0, id.length - 1),
            id[id.length - 1] - 1
        ];

        // Rebuild index only for parent's children (two nodes swapped)
        const parentPath = id.slice(0, -1);
        if (parentPath.length === 0) {
            // Parent is root, rebuild entire tree
            this.rebuildIndex();
        } else {
            // Rebuild parent's subtree
            this.rebuildIndex(parentNode, parentPath);
        }

        return newId;
    }

    /**
     * Move a node down one position in its parent's children array.
     * Swaps the node with its following sibling.
     * 
     * @param id - Hierarchical ID of the node to move
     * @returns The new hierarchical ID of the node after the move
     * @throws Error if node is already last or parent has no children
     */
    moveDown(id: IdType) {
        let parentNode = this.getParentOfId(id);

        if (!parentNode.childNodes) {
            throw new Error("Parent has no children");
        }

        moveDown(parentNode.childNodes, id[id.length - 1]);

        const newId = [
            ...id.slice(0, id.length - 1),
            id[id.length - 1] + 1
        ];

        // Rebuild index only for parent's children (two nodes swapped)
        const parentPath = id.slice(0, -1);
        if (parentPath.length === 0) {
            // Parent is root, rebuild entire tree
            this.rebuildIndex();
        } else {
            // Rebuild parent's subtree
            this.rebuildIndex(parentNode, parentPath);
        }

        return newId;
    }

    // #endregion
}