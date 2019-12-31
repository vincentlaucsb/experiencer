import ResumeNodeTree from "./NodeTree";
import { ResumeNode } from "./Types";
import { deepCopy } from "../Helpers";

export default class ObservableResumeNodeTree {
    private past = new Array<Array<ResumeNode>>();
    private future = new Array<Array<ResumeNode>>();
    private nodes: ResumeNodeTree;
    private subscriber?: (nodes: ResumeNodeTree) => void;

    constructor() {
        this.nodes = new ResumeNodeTree();
    }

    private broadcast() {
        if (this.subscriber) {
            this.subscriber(this.nodes);
        }
    }

    subscribe(func: (nodes: ResumeNodeTree) => void) {
        this.subscriber = func;
    }

    get childNodes() {
        return this.nodes.childNodes;
    }

    set childNodes(newNodes: Array<ResumeNode>) {
        this.nodes.childNodes = newNodes;
        this.broadcast();
    }

    get isUndoable() {
        return this.past.length > 0;
    }

    get isRedoable() {
        return this.future.length > 0;
    }

    addNestedChild(id, node) {
        this.past.push(deepCopy(this.childNodes));
        this.nodes.addNestedChild(id, node);
        this.broadcast();
    }

    deleteChild(id) {
        this.past.push(deepCopy(this.childNodes));
        this.nodes.deleteChild(id);
        this.broadcast();
    }

    getNodeById(id) {
        return this.nodes.getNodeById(id);
    }

    isLastSibling(id) {
        return this.nodes.isLastSibling(id);
    }

    undo() {
        const prev = this.past.pop();
        if (prev) {
            this.future.push(deepCopy(prev));
            this.nodes.childNodes = prev;
            this.broadcast();
        }
    }

    redo() {
        const next = this.future.pop();
        if (next) {
            this.nodes.childNodes = next;
            this.broadcast();
        }
    }

    updateChild(id, key, data) {
        this.past.push(deepCopy(this.childNodes));
        this.nodes.updateChild(id, key, data);
        this.broadcast();
    }

    moveUp(id) {
        this.past.push(deepCopy(this.childNodes));
        const newId = this.nodes.moveUp(id);
        this.broadcast();
        return newId;
    }

    moveDown(id) {
        this.past.push(deepCopy(this.childNodes));
        const newId = this.nodes.moveDown(id);
        this.broadcast();
        return newId;
    }
}