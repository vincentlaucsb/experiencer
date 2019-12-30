import { assignIds, deleteAt, moveUp, moveDown, deepCopy } from "../Helpers";
import { IdType, ResumeNode } from "./Types";

export default class ResumeNodeTree implements ResumeNode {
    childNodes = new Array<ResumeNode>();
    type = 'Resume';
    uuid = '';
    htmlId = '';

    constructor(children = new Array<ResumeNode>()) {
        this.childNodes = children;
    }

    traverse(id: IdType) {
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

    /** Given an array of nodes and a hierarchical ID, return a reference to the 
     *  node pointed to by id */
    getNodeById(id: IdType) {
        if (id.length === 0) {
            return this;
        }

        return this.traverse(id)[0];
    }

    getParentOfId(id: IdType) {
        return this.traverse(id)[1];
    }

    /**
     * Add an immediate child
     * @param node Node to be added
     */
    addChild(node: ResumeNode) {
        this.childNodes.push(node);
    }

    /**
     * Add node as a child to the node identified by id
     * @param id   Hierarchical id pointing to some node
     * @param node Node to be added
     */
    addNestedChild(id: IdType, node: ResumeNode) {
        let targetNode = this.getNodeById(id);
        if (!targetNode.childNodes) {
            targetNode.childNodes = new Array<ResumeNode>();
        }

        targetNode.childNodes.push(assignIds(deepCopy(node)));
    }

    deleteChild(id: IdType) {
        let parentNode = this.getParentOfId(id);

        if (parentNode.childNodes) {
            deleteAt(parentNode.childNodes, id[id.length - 1]);
        }
    }

    /**
     * Returns true if node is the last sibling in its subtree
     * @param id
     */
    isLastSibling(id: IdType) {
        let parentNode = this.getParentOfId(id);
        const position = id[id.length - 1];

        if (parentNode.childNodes) {
            return position + 1 === parentNode.childNodes.length;
        }

        throw new Error("Parent has no children");
    }

    updateChild(id: IdType, key: string, data: any) {
        let targetNode = this.getNodeById(id);
        targetNode[key] = data;
    }
    
    moveUp(id: IdType) {
        let parentNode = this.getParentOfId(id);
        if (parentNode.childNodes) {
             moveUp(parentNode.childNodes, id[id.length - 1]);
        }
        else {
            throw new Error("Parent has no children");
        }

        // Return new ID of node
        return [
            ...id.slice(0, id.length - 1),
            id[id.length - 1] - 1
        ];
    }

    moveDown(id: IdType) {
        let parentNode = this.getParentOfId(id);
        if (parentNode.childNodes) {
            moveDown(parentNode.childNodes, id[id.length - 1]);
        }
        else {
            throw new Error("Parent has no children");
        }

        // Return new ID of node
        return [
            ...id.slice(0, id.length - 1),
            id[id.length - 1] + 1
        ];
    }
}