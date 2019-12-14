import { IdType } from "./HoverTracker";
import { assignIds, deleteAt, moveUp, moveDown } from "../Helpers";

export default class ResumeNodeTree {
    children = new Array<object>();

    constructor(children = []) {
        this.children = children;
    }

    traverse(id: IdType) {
        let targetNode: object = this.children[id[0]],
            parentNode: object = this;

        for (let i = 1; i < id.length; i++) {
            if (i + 1 == id.length) {
                parentNode = targetNode;
            }

            console.log(id, targetNode);
            targetNode = targetNode['children'][id[i]];
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
        let targetNode = this.getParentOfId(id);
        if (!('children' in targetNode)) {
            targetNode['children'] = new Array<object>();
        }

        targetNode['children'].push(assignIds(node));
    }

    deleteChild(id: IdType) {
        let parentNode = this.getParentOfId(id);
        deleteAt(parentNode['children'], id[id.length - 1]);
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
        let parentNode = this.getNodeById(id)[1];
        parentNode = moveUp(parentNode['children'], id[id.length - 1]);
    }

    moveDown(id: IdType) {
        let parentNode = this.getNodeById(id)[1];
        moveDown(parentNode['children'], id[id.length - 1]);
    }
}