import { Action } from "../utility/Types";

/** Things you can do with a selected node */
export interface SelectedNodeActions {
    copyClipboard: Action;
    cutClipboard: Action;
    delete: Action;
    moveUp?: Action;
    moveDown?: Action;
    pasteClipboard?: Action;
}