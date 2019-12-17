import { Action } from "../ResumeNodeBase";

/** Things you can do with a selected node */
export interface SelectedNodeActions {
    edit: Action;
    delete: Action;
    moveUp: Action;
    moveDown: Action;

    /** Editing */
    copyClipboard: Action;
    cutClipboard: Action;
    pasteClipboard: Action;
}