import { Action } from "../ResumeNodeBase";

export interface SelectedNodeActions {
    moveUp: Action;
    moveDown: Action;
    delete: Action;

    /** Editing */
    copyClipboard: Action;
    cutClipboard: Action;
    pasteClipboard: Action;
}