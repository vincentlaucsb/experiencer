import ClassStore from '@/shared/ClassStore';
import CssNode from '@/shared/CssTree';
import { CssNodeDump } from '@/types';
import { deepCopy } from '@/shared/utils/deepCopy';

type HistoryRecorder = (snapshot: CssNodeDump) => void;

/** Gates CSS-tree mutations, undo history, and React-compatible snapshots. */
export default class CssStore extends ClassStore<CssNode> {
    protected _data: CssNode;
    private historyRecorder: HistoryRecorder = () => undefined;
    /** Last committed tree, retained independently of mutable live CSS references. */
    private committedCss: CssNodeDump;

    constructor(initialCss: CssNode) {
        super();
        this._data = initialCss;
        this.committedCss = deepCopy(initialCss.dump());
    }

    setHistoryRecorder(recorder?: HistoryRecorder): void {
        this.historyRecorder = recorder ?? (() => undefined);
    }

    /**
     * Replace the entire CSS tree.
     */
    setCss(css: CssNode): void {
        this.withMutation(() => {
            this.data = css;
            this.committedCss = deepCopy(css.dump());
        });
    }

    /**
     * Update CSS tree using a mutating function.
     * Applies mutations directly to the tree and notifies subscribers.
     * 
     * @param updater - Function that mutates the CSS tree
     */
    updateCss(updater: (css: CssNode) => void): void {
        this.historyRecorder(deepCopy(this.committedCss));
        this.withMutation(() => {
            updater(this.data);
            this.committedCss = deepCopy(this.data.dump());
        });
    }

    /**
     * Load CSS from serialized data.
     */
    loadCss(cssData: CssNodeDump): void {
        this.withMutation(() => {
            this.data = CssNode.load(cssData);
            this.committedCss = deepCopy(cssData);
        });
    }

    /**
     * Get the stylesheet string representation.
     */
    getStylesheet(): string {
        return this.data.stylesheet();
    }
}
