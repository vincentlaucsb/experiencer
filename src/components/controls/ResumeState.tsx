import { EditorMode } from "../ResumeComponent";
import { IdType } from "../utility/HoverTracker";
import { ResumeNode } from "../utility/NodeTree";
import CssNode, { CssNodeDump } from "../utility/CssTree";

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    children: Array<ResumeNode>;
}

export default interface ResumeState {
    css: CssNode;
    children: Array<ResumeNode>;
    mode: EditorMode;

    activeTemplate?: string;
    clipboard?: object;

    hoverNode?: IdType;
    selectedNode?: IdType;
}