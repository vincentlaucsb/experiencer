import CssNode from './index';

/**
 * A non-modifiable wrapper around CssNode.
 * 
 * Prevents accidental mutations by:
 * - Making read-only getters that return copies/wrapped values
 * - Removing all mutation methods (add, delete, setProperty, etc.)
 * - Returning frozen arrays for fullPath
 * - Returning defensive copies of Maps for properties
 * 
 * This enforces that all mutations must go through the proper update callbacks.
 */
export class ReadonlyCssNode {
    private node: CssNode;

    constructor(node: CssNode) {
        this.node = node;
    }

    /**
     * Get child nodes wrapped as ReadonlyCssNode instances.
     * Each child is independently wrapped, preventing mutation.
     */
    get children(): ReadonlyArray<ReadonlyCssNode> {
        return this.node.children.map((node) =>
            new ReadonlyCssNode(node));
    }

    /**
     * Get the description for this CSS node.
     */
    get description(): string | undefined {
        return this.node.description;
    }

    /**
     * Get the full path to this node in the tree.
     * Returns a frozen copy to prevent external mutations.
     */
    get fullPath(): ReadonlyArray<string> {
        return Object.freeze([...this.node.fullPath]);
    }

    /**
     * Get the full CSS selector, computed from this node and all ancestors.
     */
    get fullSelector(): string {
        return this.node.fullSelector;
    }

    /**
     * Check if this is the root node.
     */
    get isRoot(): boolean {
        return this.node.isRoot;
    }

    /**
     * Get the name of this CSS node.
     */
    get name(): string {
        return this.node.name;
    }

    /**
     * Get a read-only copy of the CSS properties.
     * Returns a new Map instance to prevent external mutations.
     */
    get properties(): ReadonlyMap<string, string> {
        return new Map(this.node.properties);
    }

    /**
     * Get the CSS selector for this specific node (before fullSelector computation).
     */
    get selector(): string {
        return this.node.selector;
    }

    /**
     * Check if this node has a child with the given name.
     */
    hasName(name: string): boolean {
        return this.node.hasName(name);
    }
}
