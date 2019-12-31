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
        this.undo = this.undo.bind(this);
        this.redo = this.redo.bind(this);
    }

    private broadcast() {
        if (this.subscriber) {
            this.subscriber(this.nodes);
        }
    }

    private updatePast() {
        this.past.push(deepCopy(this.childNodes));
        this.future = new Array<Array<ResumeNode>>();
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
        this.updatePast();
        this.nodes.addNestedChild(id, node);
        this.broadcast();
    }

    deleteChild(id) {
        this.updatePast();
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
            this.future.push(deepCopy(this.childNodes));
            this.nodes.childNodes = prev;
            this.broadcast();
        }
    }

    redo() {
        const next = this.future.pop();
        if (next) {
            this.past.push(deepCopy(this.childNodes));
            this.nodes.childNodes = next;
            this.broadcast();
        }
    }

    updateChild(id, key, data) {
        this.updatePast();
        this.nodes.updateChild(id, key, data);
        this.broadcast();
    }

    moveUp(id) {
        this.updatePast();
        const newId = this.nodes.moveUp(id);
        this.broadcast();
        return newId;
    }

    moveDown(id) {
        this.updatePast();
        const newId = this.nodes.moveDown(id);
        this.broadcast();
        return newId;
    }
}