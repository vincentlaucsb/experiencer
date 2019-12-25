export type IdType = Array<number>;

/** Helper class for keeping track of elements we are hovering over
 *  and which are selectable
 * */
export default class HoverTracker {
    private _currentId: IdType;
    private _hovering: Set<string>;

    constructor() {
        this._currentId = new Array<number>();
        this._hovering = new Set<string>();

        this.isHovering = this.isHovering.bind(this);
    }

    get currentDepth() {
        return this._currentId.length;
    }

    get currentId() : IdType {
        return [ ...this._currentId ];
    }

    hoverOver(id: IdType) {
        const newDepth = id.length;

        if (newDepth === this.currentDepth) {
            // We selected a sibling
            const lastIdx = id.length - 1;
            if (id[lastIdx] === this.currentId[lastIdx]) {
                this._currentId = id;
            }
        }
        else if (newDepth > this.currentDepth) {
            // New node is deeper: Should be selected
            this._currentId = id;
        }
        else
        {
            // Last index of the shorter array
            const lastIdx = id.length - 1;
            if (id[lastIdx] !== this.currentId[lastIdx]) {
                // We are hovering over a completely new set of elements
                this._currentId = id;
                this._hovering.clear();
            }
        }

        this._hovering.add(id.join('-'));
    }

    hoverOut(id: IdType) {
        // TODO: Explain what this is
        this._currentId.pop();
        this._hovering.delete(id.join('-'));
    }

    isHovering(id: IdType) {
        return this._hovering.has(id.join('-'));
    }
}