import { EditorMode } from "../ResumeComponent";
import { IdType } from "../utility/HoverTracker";
import { ResumeNode } from "../utility/NodeTree";
import CssNode, { CssNodeDump } from "../utility/CssTree";

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    rootCss: CssNodeDump;
    childNodes: Array<ResumeNode>;
}

export default interface ResumeState {
    css: CssNode;
    rootCss: CssNode;
    childNodes: Array<ResumeNode>;
    mode: EditorMode;
    unsavedChanges: boolean;

    activeTemplate?: string;
    clipboard?: object;

    isEditingSelected: boolean;
    hoverNode?: IdType;
    selectedNode?: IdType;
}