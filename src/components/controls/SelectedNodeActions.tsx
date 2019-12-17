import { Action } from "../ResumeNodeBase";

/** Things you can do with a selected node */
export interface SelectedNodeActions {
    moveUp: Action;
    moveDown: Action;
    delete: Action;

    /** Editing */
    copyClipboard: Action;
    cutClipboard: Action;
    pasteClipboard: Action;
}