﻿import { isNullOrUndefined } from "util";
import { deleteAt } from "../Helpers";

/** Return a JSON serializable format of a CssNode and its descendents */
export interface CssNodeDump {
    children: Array<CssNodeDump>;
    root?: CssNodeDump;
    name: string;
    selector: string;
    properties: Array<[string, string]>;
}

export default class CssNode {
    /** A mapping of keys to CSS properties */
    private _children: Array<CssNode>;

    /** Keep track of names added */
    private _childNames = new Set<string>();

    private _name: string;
    private _selector: string;
    private _properties: Map<string, string>;
    private parent?: CssNode;

    /** CSS :root selector */
    public cssRoot?: CssNode;

    public description?: string;

    constructor(name: string, properties: object, selector?: string) {
        this._name = name;
        this._children = new Array<CssNode>();
        this._properties = new Map<string, string>();

        for (let k in properties) {
            this._properties.set(k, properties[k]);
        }

        this._selector = selector || "";
    }

    get name() {
        return this._name;
    }

    get selector() {
        return this._selector;
    }

    /** Get the root of the tree */
    get treeRoot() {
        let parent = this.parent;
        if (!parent) {
            return this;
        }

        while (true) {
            if (isNullOrUndefined(parent.parent)) {
                return parent;
            }
            else {
                parent = parent.parent;
            }
        }
    }

    /** Compute the full CSS selector for this subtree */
    get fullSelector() {
        // Build an array of all of this node's ancestors
        let nodes = new Array<CssNode>(this);
        let parent = this.parent;
        while (!isNullOrUndefined(parent)) {
            nodes.push(parent);
            parent = parent.parent;
        }

        // Now ordered from top to bottom
        nodes = nodes.reverse();

        let selectors = new Array<string>();

        // Build CSS selector by traversing from the top down,
        // appending each node's selector to each selector in the 
        // current array of selectors as we go
        for (let node of nodes) {
            // Split selectors by comma and remove extra whitespace
            let partialSelectors = node.selector.split(',').map(
                (sel: string) => sel.trim());

            if (selectors.length > 0) {
                let buffer = [...selectors];
                selectors = new Array<string>();
                for (let selector of buffer) {
                    for (let partialSelector of partialSelectors) {
                        const space = (partialSelector.charAt(0) === ":") ? "" : " ";
                        selectors.push(`${selector}${space}${partialSelector}`);
                    }
                }
            }
            else {
                // Base case
                selectors = [...partialSelectors];
            }
        }

        return selectors.join(', ');
    }

    /** Get this node's path in the subtree */
    get fullPath() {
        let parent = this.parent;
        let path = [ this.name ];

        while (!isNullOrUndefined(parent)) {
            path.push(parent.name);
            parent = parent.parent;
        }

        // Remove top most name from path
        path = path.slice(0, path.length - 1);

        return path.reverse();
    }

    get children() {
        return this._children;
    }

    get properties(): Map<string, string> {
        return this._properties;
    }

    set properties(data: Map<string, string>) {
        this._properties = data;
    }

    static load(data: CssNodeDump): CssNode {
        let rootNode = new CssNode(data.name, {}, data.selector);
        rootNode.properties = new Map<string, string>(data.properties);

        // Load children
        for (let node of data.children) {
            rootNode.addNode(CssNode.load(node));
        }

        // Load root
        if (data.root) {
            rootNode.cssRoot = CssNode.load(data.root);
        }

        return rootNode;
    }

    dump() : CssNodeDump {
        let data: CssNodeDump = {
            children: this.children.map((elem) => elem.dump()),
            name: this.name,
            properties: Array.from(this.properties.entries()),
            selector: this.selector
        }

        if (this.cssRoot) {
            data.root = this.cssRoot.dump();
        }

        return data;
    }

    private formatProperties() {
        let cssProperties = new Array<string>();
        if (this.properties.size > 0) {
            for (let [property, entry] of this.properties.entries()) {
                cssProperties.push(`\t${property}: ${entry};`);
            }
        }

        return cssProperties.join('\n');
    }

    /** Return a CSS stylesheet */
    stylesheet() {
        let cssProperties = this.formatProperties();
        const thisCss = this.properties.size > 0 ? `${this.fullSelector} {\n${cssProperties}\n}` : ``;

        let childStylesheets = new Array<string>();

        // :root before others
        if (this.cssRoot) {
            childStylesheets.push(this.cssRoot.stylesheet());
        }

        for (let cssTree of this.children.values()) {
            childStylesheets.push(cssTree.stylesheet());
        }

        let finalStylesheet = thisCss;
        if (childStylesheets.length > 0) {
            finalStylesheet += "\n\n";
            finalStylesheet += childStylesheets.join('\n\n');
        }

        return finalStylesheet;
    }

    /**
     * Add a CssNode and return a reference to the added node
     * @param css
     */
    add(name: string, properties, selector?: string): CssNode {
        return this.addNode(new CssNode(name, properties, selector || name));
    }

    addNode(node: CssNode): CssNode {
        if (this.hasName(node.name)) {
            throw new Error(`Already have a child named ${node.name}`);
        }

        node.parent = this;
        this.children.push(node);
        this._childNames.add(node.name);
        return this.children[this.children.length - 1];
    }

    // TODO: Add tests
    delete(path: string[]) {
        const parent = this.findNode(path.slice(0, path.length - 1));
        const childName = path[path.length - 1];
        if (parent && parent.hasName(childName)) {
            parent.deleteDirectChild(childName);
        }
    }

    private deleteDirectChild(name: string) {
        this._childNames.delete(name);

        let deleteIndex = -1;
        for (let i in this._children) {
            if (this._children[i].name === name) {
                deleteIndex = parseInt(i);
                break;
            }
        }

        if (deleteIndex >= 0) {
            this._children = deleteAt(this._children, deleteIndex);
        }
    }
    
    /**
     * Returns true if there is already a child node with the given name
     * @param name Name to look for
     */
    hasName(name: string) {
        return this._childNames.has(name);
    }

    /** Return a copy of this subtree with the same names and selectors
     *  but with no properties
     *  @param name     New name for the copy (defaults to current name)
     *  @param selector Additional selector to append on to current selector
     */
    copySkeleton(name?: string, selector?: string): CssNode {
        const newName = name || this.name;
        let newSelector = selector || this.selector;

        let newTree = new CssNode(newName, {}, newSelector);
        for (let node of this.children) {
            newTree.addNode(node.copySkeleton());
        }

        return newTree;
    }

    /**
     * Find a CSS node somewhere in this subtree
     * @param path A list of names ordered from higher up in the tree to lower
     */
    findNode(path: string | string[]): CssNode | undefined {
        if (path.length === 0) {
            return this;
        }

        if (!Array.isArray(path)) {
            path = [path];
        }

        for (let node of this.children) {
            if (node.name === path[0]) {
                // No more subtrees to traverse
                if (path.length === 1) {
                    return node;
                }

                return node.findNode(path.slice(1));
            }
        }

        return;
    }

    setProperty(path: string[], key: string, value: string) {
        const targetNode = this.findNode(path);
        if (targetNode) {
            targetNode.properties.set(key, value);
        }
    }

    deleteProperty(path: string[], key: string) {
        const targetNode = this.findNode(path);
        if (targetNode) {
            targetNode.properties.delete(key);
        }
    }
    
    setProperties(path: string | string[],
        properties: Array<[string, string]> | Map<string, string>) {
        const targetNode = this.findNode(path);
        if (targetNode) {
            if (Array.isArray(properties)) {
                properties = new Map<string, string>(properties);
            }

            targetNode.properties = properties;
        }
    }
}