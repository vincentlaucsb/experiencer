import ClassStore from '@/shared/ClassStore';
import CssNode from '@/shared/CssTree';
import { CssNodeDump } from '@/types';

/**
 * Store wrapper for CssNode that integrates with React's useSyncExternalStore.
 * 
 * Handles CSS tree mutations with automatic change notifications.
 */
export default class CssStore extends ClassStore<CssNode> {
    protected _data: CssNode;

    constructor(initialCss: CssNode) {
        super();
        this._data = initialCss;
    }

    /**
     * Replace the entire CSS tree.
     */
    setCss(css: CssNode): void {
        this.withMutation(() => {
            this.data = css;
        });
    }

    /**
     * Update CSS tree using a mutating function.
     * Applies mutations directly to the tree and notifies subscribers.
     * 
     * @param updater - Function that mutates the CSS tree
     */
    updateCss(updater: (css: CssNode) => void): void {
        this.withMutation(() => {
            updater(this.data);
        });
    }

    /**
     * Load CSS from serialized data.
     */
    loadCss(cssData: CssNodeDump): void {
        this.withMutation(() => {
            this.data = CssNode.load(cssData);
        });
    }

    /**
     * Get the stylesheet string representation.
     */
    getStylesheet(): string {
        return this.data.stylesheet();
    }
}
