import { isNullOrUndefined } from "@/shared/utils/Helpers";
import { CssNodeDump } from "@/types";
import { ReadonlyCssNode } from './ReadonlyCssNode';

export const DEFAULT_INDENT = '  ';

export default class CssNode {
    /**
     * A mapping of child node names to CSS nodes.
     * 
     * A map is used to support O(1) lookup of child nodes by name,
     * which is necessary for efficient updates and deletions.
     */
    private _children = new Map<string, CssNode>();

    /** Keep track of names added */
    private _childNames = new Set<string>();

    private _indent: string = DEFAULT_INDENT;
    private _name: string;
    private _selector: string;
    private _properties: Map<string, string>;
    private parent?: CssNode;

    public description?: string;

    /**
     * Create a new CSS node
     * @param name
     * @param properties
     * @param selector
     */
    constructor(name: string, properties: Record<string, string>, selector?: string) {
        this._name = name;
        this._properties = new Map<string, string>();

        for (let k in properties) {
            this._properties.set(k, properties[k]);
        }

        // Use name as selector if not provided
        this._selector = selector || name;
    }

    // #region Getters/Setters

    get children() {
        return Array.from(this._children.values());
    }

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

    get indent() {
        return this._indent;
    }

    set indent(newIndent: string) {
        this._indent = newIndent;
    }

    get isRoot() {
        return isNullOrUndefined(this.parent);
    }

    get name() {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
    }

    get properties(): Map<string, string> {
        return this._properties;
    }

    set properties(data: Map<string, string>) {
        this._properties = data;
    }

    get selector() {
        return this._selector;
    }

    set selector(newSelector: string) {
        this._selector = newSelector;
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

    // #endregion Getters/Setters

    // #region Public Methods

    /**
     * Add a CssNode and return a reference to the added node.
     * This is a shortcut for `addNode(new CssNode(name, properties, selector))`.
     * 
     * @param name Name of the new node
     * @param properties CSS properties for the new node
     * @param selector Optional CSS selector for the new node (defaults to name)
     * 
     * @returns The added node.
     */
    add(name: string, properties: Record<string, string>, selector?: string): CssNode {
        return this.addNode(new CssNode(name, properties, selector || name));
    }

    addNode(node: CssNode): CssNode {
        if (this.hasName(node.name)) {
            throw new Error(`Already have a child named ${node.name}`);
        }

        node.parent = this;
        this._children.set(node.name, node);
        this._childNames.add(node.name);
        return node;
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
        for (let node of this._children.values()) {
            newTree.addNode(node.copySkeleton());
        }

        return newTree;
    }

    deepCopy(): CssNode {
        return CssNode.load(this.dump());
    }

    /**
     * Delete a node somewhere in this subtree, given its path from this node.
     * @param path A list of names ordered from higher up in the tree to lower, ending with the name of the node to delete
     */
    delete(path: string[]) {
        const parent = this.findNode(path.slice(0, path.length - 1));
        const childName = path[path.length - 1];
        if (parent && parent.hasName(childName)) {
            parent.deleteDirectChild(childName);
        }
    }

    deleteProperty(path: string[], key: string) {
        this.findNode(path)?.properties.delete(key);
    }

    dump() : CssNodeDump {
        let data: CssNodeDump = {
            children: this.children.map((elem) => elem.dump()),
            name: this.name,
            description: this.description,
            properties: Array.from(this.properties.entries()),
            selector: this.selector
        }

        return data;
    }

    /**
     * Find a CSS node somewhere in this subtree
     * @param path A list of names ordered from higher up in the tree to lower
     */
    findNode(path: string | string[]): CssNode | undefined {
        if (path.length === 0) return this;

        let _normalizedPath = Array.isArray(path) ? path : [path];
        _normalizedPath.reverse();

        let currentNode: CssNode | undefined = this as CssNode;

        while (currentNode != undefined) {
            const nextName = _normalizedPath.pop();
            
            // If we've reached the end of the path, return the matching node
            // if it exists, or undefined if it doesn't
            if (_normalizedPath.length === 0) {
                return currentNode._children.get(nextName!);
            }

            currentNode = currentNode._children.get(nextName!);
        }

        return undefined;
    }

    /**
     * Returns true if there is already a child node with the given name
     * @param name Name to look for
     */
    hasName(name: string) {
        return this._childNames.has(name);
    }

    static load(data: CssNodeDump): CssNode {
        let rootNode = new CssNode(data.name, {}, data.selector);
        rootNode.properties = new Map<string, string>(data.properties);
        rootNode.description = data.description;

        // Load children
        for (let node of data.children) {
            rootNode.addNode(CssNode.load(node));
        }

        return rootNode;
    }

    mustFindNode(path: string | string[]): CssNode {
        const result = this.findNode(path);
        if (!result) {
            const pathStr = Array.isArray(path) ? path.join(', ') : path;
            throw new Error(`Couldn't find node at ${pathStr}`);
        }

        return result;
    }

    setProperty(path: string[], key: string, value: string) {
        this.findNode(path)?.properties.set(key, value);
    }

    setProperties(properties: Array<[string, string]>, path?: string | string[]) {
        const targetNode = path ? this.findNode(path) : this;
        if (targetNode) {
            targetNode.properties = new Map<string, string>(properties);
        }

        return this;
    }

    /** Return a CSS stylesheet */
    stylesheet() {
        const cssProperties = this.formatProperties();
        const thisCss = this.properties.size > 0 ? `${this.fullSelector} {\n${cssProperties}\n}` : ``;

        let childStylesheets = new Array<string>();

        for (let cssTree of this._children.values()) {
            const childCss = cssTree.stylesheet();
            if (childCss.length > 0) {
                childStylesheets.push(childCss);
            }
        }

        let finalStylesheet = [ thisCss ];
        if (childStylesheets.length > 0) {
            finalStylesheet = finalStylesheet.concat(childStylesheets);
        }

        return finalStylesheet.join('\n\n');
    }

    updateProperties(properties: Array<[string, string]>, path?: string | string[]) {
        const targetNode = path ? this.findNode(path) : this;
        if (targetNode) {
            properties.forEach((pair) => {
                targetNode.properties.set(pair[0], pair[1]);
            })
        }

        return this;
    }

    // #endregion Public Methods

    // #region Private Methods

    /** Delete a direct child node with the given name. */
    private deleteDirectChild(name: string) {
        this._childNames.delete(name);

        if (this._children.has(name)) {
            this._children.delete(name);
        }
    }

    /** Format the CSS properties for this node */
    private formatProperties() {
        if (this.properties.size <= 0) return '';

        const cssProperties: string[] = [];

        for (const [property, entry] of this.properties.entries()) {
            cssProperties.push(`${this._indent}${property}: ${entry};`);
        }

        return cssProperties.join('\n');
    }

    // #endregion Private Methods
}

export { ReadonlyCssNode };