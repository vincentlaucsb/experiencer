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

    get children() {
        return this._children;
    }

    get properties() {
        return this._properties;
    }

    set properties(data: Map<string, string>) {
        this._properties = data;
    }

    static load(data: CssNodeDump): CssNode {
        let node = new CssNode(data.name, {}, data.selector);
        node.properties = new Map<string, string>(data.properties);
        node._children = data.children.map((elem) => CssNode.load(elem));
        return node;
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
    stylesheet() {
        let cssProperties = "";
        if (this.properties.size > 0) {
            for (let [property, entry] of this.properties.entries()) {
                cssProperties += `${property}: ${entry};\n`;
            }
        }

        const thisCss = this.properties.size > 0 ? `${this.selector} {
    ${cssProperties}
}` : ``;

        let childStylesheets = "";
        for (let cssTree of this.children.values()) {
            childStylesheets += cssTree.stylesheet();
        }

        return `${thisCss}
    
${childStylesheets}`
    }

    /**
     * Add a CssNode and return a reference to the added node
     * @param css
     */
    add(css: CssNode): CssNode {
        css._selector = `${this.selector} ${css._selector}`
        this.children.push(css);
        return this.children[this.children.length - 1];
    }
}