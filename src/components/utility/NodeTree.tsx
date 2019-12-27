import { IdType } from "./HoverTracker";
import { assignIds, deleteAt, moveUp, moveDown, deepCopy } from "../Helpers";

/** The properties a node can be expected to have
 *  in a JSON representation
 *  
 *  This is a non-exclusive list... there may be others
 * */
export interface BasicResumeNode {
    children?: Array<BasicResumeNode>;
    classNames?: string;
    htmlId?: string;
    value?: string;

    // TODO: Change to 'Row' | 'Column' | etc. ?
    type: string;
}

export interface ResumeNode extends BasicResumeNode {
    children?: Array<ResumeNode>;

    // UUIDs are assigned by the app and need not be saved
    uuid: string;
}

export default class ResumeNodeTree implements ResumeNode {
    children = new Array<ResumeNode>();
    type = 'Resume';
    uuid = '';
    htmlId = '';

    constructor(children = new Array<ResumeNode>()) {
        this.children = children;
    }

    traverse(id: IdType) {
        let targetNode: ResumeNode = this.children[id[0]],
            parentNode: ResumeNode = this;

        for (let i = 1; i < id.length; i++) {
            if (i + 1 === id.length) {
                parentNode = targetNode;
            }

            if (targetNode.children) {
                targetNode = targetNode.children[id[i]];
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
        this.children.push(node);
    }

    /**
     * Add node as a child to the node identified by id
     * @param id   Hierarchical id pointing to some node
     * @param node Node to be added
     */
    addNestedChild(id: IdType, node: ResumeNode) {
        let targetNode = this.getNodeById(id);
        if (!targetNode.children) {
            targetNode.children = new Array<ResumeNode>();
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
            return position + 1 === parentNode.children.length;
        }

        throw new Error("Parent has no children");
    }

    updateChild(id: IdType, key: string, data: any) {
        let targetNode = this.getNodeById(id);
        targetNode[key] = data;
    }
    
    moveUp(id: IdType) {
        let parentNode = this.getParentOfId(id);
        if (parentNode.children) {
             moveUp(parentNode.children, id[id.length - 1]);
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
        if (parentNode.children) {
            moveDown(parentNode.children, id[id.length - 1]);
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