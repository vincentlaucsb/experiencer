import { isNullOrUndefined } from "util";
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
    // **TODO: Fix selector generator wrt commas*/
    /** TODO: Use this to generate stylesheets */
    get fullSelector() {
        let parent = this.parent;
        let selectors = this._selector.split(',');
        let finalSelectors = new Array<string>();

        for (let selector of selectors) {
            selector = selector.trim();
            while (!isNullOrUndefined(parent)) {
                // No space for pseudo-classes or elements
                const space = (selector.charAt(0) === ':') ? '' : ' ';
                selector = `${parent.selector}${space}${selector}`;
                parent = parent.parent;
            }

            finalSelectors.push(selector);
        }

        return finalSelectors.join(', ');
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
    stylesheet(parentSelector?: string) {
        // Generate individual rulesets for "," seperated selectors
        let selectors = this.selector.split(',');
        let stylesheets = new Array<string>();

        for (let selector of selectors) {
            // No need for trailing/leading whitespace
            selector = selector.trim();

            if (parentSelector) {
                // Don't add space for pseudo-elements and pseudo-classes
                selector = (selector.charAt(0) === ':') ? `${parentSelector}${selector}`
                    : `${parentSelector} ${selector}`;
            }

            let cssProperties = this.formatProperties();
            const thisCss = this.properties.size > 0 ? `${selector} {\n${cssProperties}\n}` : ``;

            let childStylesheets = new Array<string>();
            // :root before others
            if (this.cssRoot) {
                childStylesheets.push(this.cssRoot.stylesheet());
            }

            for (let cssTree of this.children.values()) {
                childStylesheets.push(cssTree.stylesheet(selector));
            }

            let finalStylesheet = thisCss;
            if (childStylesheets.length > 0) {
                finalStylesheet += "\n\n";
                finalStylesheet += childStylesheets.join('\n\n');
            }

            stylesheets.push(finalStylesheet);
        }

        return stylesheets.join('\n\n');
    }

    /**
     * Add a CssNode and return a reference to the added node
     * @param css
     */
    add(css: CssNode): CssNode {
        if (this.hasName(css.name)) {
            throw new Error(`Already have a child named ${css.name}`);
        }

        css.parent = this;
        this.children.push(css);
        this._childNames.add(css.name);
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
            newTree.add(node.copySkeleton());
        }

        return newTree;
    }

    /**
     * Find a CSS node somewhere in this subtree
     * @param path A list of names ordered from higher up in the tree to lower
     */
    findNode(path: string[]): CssNode | undefined {
        if (path.length == 0) {
            return this;
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