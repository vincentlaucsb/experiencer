import { isNullOrUndefined } from "util";

/** Return a JSON serializable format of a CssNode and its descendents */
export interface CssNodeDump {
    children: Array<CssNodeDump>;
    name: string;
    selector: string;
    properties: Array<[string, string]>;
}

export default class CssNode {
    /** A mapping of keys to CSS properties */
    private _children: Array<CssNode>;
    private _name: string;
    private _selector: string;
    private _properties: Map<string, string>;
    private parent?: CssNode;

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

    /** Compute the full CSS selector for this subtree */
    get fullSelector() {
        let selector = this._selector;
        let parent = this.parent;
        while (!isNullOrUndefined(parent)) {
            selector = `${parent.selector} ${selector}`;
            parent = parent.parent;
        }

        return selector;
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
            rootNode.add(CssNode.load(node));
        }

        return rootNode;
    }

    dump() : CssNodeDump {
        return {
            children: this.children.map((elem) => elem.dump()),
            name: this.name,
            selector: this.selector,
            properties: Array.from(this.properties.entries())
        }
    }

    /** Return a CSS stylesheet */
    stylesheet(parentSelector?: string) {
        let selector = this.selector;
        if (parentSelector) {
            selector = `${parentSelector} ${this.selector}`
        }

        let cssProperties = "";
        if (this.properties.size > 0) {
            for (let [property, entry] of this.properties.entries()) {
                cssProperties += `${property}: ${entry};\n`;
            }
        }

        const thisCss = this.properties.size > 0 ? `${selector} {
    ${cssProperties}
}` : ``;

        let childStylesheets = "";
        for (let cssTree of this.children.values()) {
            childStylesheets += cssTree.stylesheet(selector);
        }

        return `${thisCss}
    
${childStylesheets}`
    }

    /**
     * Add a CssNode and return a reference to the added node
     * @param css
     */
    add(css: CssNode): CssNode {
        css.parent = this;
        this.children.push(css);
        return this.children[this.children.length - 1];
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
            newTree.add(node.copySkeleton());
        }

        return newTree;
    }

    /**
     * Find a CSS node somewhere in this subtree
     * @param path A list of names ordered from higher up in the tree to lower
     */
    findNode(path: string[]) : CssNode | undefined {
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

    setProperties(path: string[], properties: Array<[string, string]> | Map<string, string>) {
        const targetNode = this.findNode(path);
        if (targetNode) {
            if (Array.isArray(properties)) {
                properties = new Map<string, string>(properties);
            }

            targetNode.properties = properties;
        }
    }
}