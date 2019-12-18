/** Return a JSON serializable format of a CssNode and its descendents */
export interface CssNodeDump {
    children: Array<CssNodeDump>;
    name: string;
    selector: string;
    properties: Array<[string, string]>;
}

export default class CssNode {
    /** A mapping of keys to CSS properties */
    children: Array<CssNode>;
    name: string;
    selector: string;
    properties: Map<string, string>;

    constructor(name: string, properties: object, selector?: string) {
        this.name = name;
        this.children = new Array<CssNode>();
        this.properties = new Map<string, string>();

        for (let k in properties) {
            this.properties.set(k, properties[k]);
        }

        this.selector = selector || "";
    }

    static load(data: CssNodeDump): CssNode {
        let node = new CssNode(data.name, {}, data.selector);
        node.properties = new Map<string, string>(data.properties);
        node.children = data.children.map((elem) => CssNode.load(elem));
        return node;
    }

    dump() : CssNodeDump {
        return {
            children: this.children.map((elem) => elem.dump()),
            name: this.name,
            selector: this.name,
            properties: Array.from(this.properties.entries())
        }
    }

    /** Return a CSS stylesheet */
    stylesheet(selector?: string) {
        let newSelector = selector ? `${selector} ${this.selector}` : this.selector;
        let cssProperties = "";
        if (this.properties.size > 0) {
            for (let [property, entry] of this.properties.entries()) {
                cssProperties += `${property}: ${entry};\n`;
            }
        }

        const thisCss = this.properties.size > 0 ? `${newSelector} {
    ${cssProperties}
}` : ``;

        let childStylesheets = "";
        for (let cssTree of this.children.values()) {
            childStylesheets += cssTree.stylesheet(newSelector);
        }

        return `${thisCss}
    
${childStylesheets}`
    }

    /**
     * Add a CssNode and return a reference to the added node
     * @param css
     */
    add(css: CssNode): CssNode {
        this.children.push(css);
        return this.children[this.children.length - 1];
    }
}