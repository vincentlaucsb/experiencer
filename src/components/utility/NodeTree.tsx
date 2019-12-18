import { IdType } from "./HoverTracker";
import { assignIds, deleteAt, moveUp, moveDown, deepCopy } from "../Helpers";
import { BasicNodeProps } from "../ResumeNodeBase";

/** The properties a node can be expected to have
 *  in a JSON representation
 * */
export interface BasicResumeNode {
    children?: Array<BasicResumeNode>;
}

export default class ResumeNodeTree implements BasicResumeNode {
    children = new Array<BasicResumeNode>();

    constructor(children = new Array<object>()) {
        this.children = children;
    }

    traverse(id: IdType) {
        let targetNode: BasicResumeNode = this.children[id[0]],
            parentNode: BasicResumeNode = this;

        for (let i = 1; i < id.length; i++) {
            if (i + 1 == id.length) {
                parentNode = targetNode;
            }

            if (targetNode.children) {
                targetNode = targetNode.children[id[i]];
            }
            else {
                throw "Target node has no children";
            }
        }

        return [targetNode, parentNode];
    }

    /** Given an array of nodes and a hierarchical ID, return a reference to the 
     *  node pointed to by id */
    getNodeById(id: IdType) {
        return this.traverse(id)[0];
    }

    getParentOfId(id: IdType) {
        return this.traverse(id)[1];
    }

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild(node: object) {
        this.children.push(node);
    }

    /**
     * Add node as a child to the node identified by id
     * @param id   Hierarchical id pointing to some node
     * @param node Node to be added
     */
    addNestedChild(id: IdType, node: object) {
        let targetNode = this.getNodeById(id);
        if (!targetNode.children) {
            targetNode.children = new Array<object>();
        }

        targetNode.children.push(assignIds(deepCopy(node)));
    }

    deleteChild(id: IdType) {
        let parentNode = this.getParentOfId(id);

        if (parentNode.children) {
            deleteAt(parentNode.children, id[id.length - 1]);
        }
    }

    /**
     * Returns true if node is the last sibling in its subtree
     * @param id
     */
    isLastSibling(id: IdType) {
        let parentNode = this.getParentOfId(id);
        const position = id[id.length - 1];

        if (parentNode.children) {
            return position + 1 == parentNode.children.length;
        }

        throw "Parent has no children";
    }

    updateChild(id: IdType, key: string, data: any) {
        let targetNode = this.getNodeById(id);
        targetNode[key] = data;
    }

    toggleEdit(id: IdType) {
        let targetNode = this.getNodeById(id);
        const currentValue = targetNode['isEditing'];
        targetNode['isEditing'] = !currentValue;
    }

    moveUp(id: IdType) {
        let parentNode = this.getParentOfId(id);
        if (parentNode.children) {
             moveUp(parentNode.children, id[id.length - 1]);
        }
        else {
            throw "Parent has no children";
        }

        // Return new ID of node
        return [
            ...id.slice(0, id.length - 1),
            id[id.length - 1] - 1
        ];
    }

    moveDown(id: IdType) {
        let parentNode = this.getParentOfId(id);
        if (parentNode.children) {
            moveDown(parentNode.children, id[id.length - 1]);
        }
        else {
            throw "Parent has no children";
        }

        // Return new ID of node
        return [
            ...id.slice(0, id.length - 1),
            id[id.length - 1] + 1
        ];
    }
}