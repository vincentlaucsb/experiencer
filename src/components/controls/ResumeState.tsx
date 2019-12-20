import { EditorMode } from "../ResumeComponent";
import { SectionHeaderPosition } from "../Section";
import { IdType } from "../utility/HoverTracker";
import { CustomToolbarOptions } from "../ResumeNodeBase";
import { BasicResumeNode, ResumeNode } from "../utility/NodeTree";
import CssNode, { CssNodeDump } from "../utility/CssTree";

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    specificCss: CssNodeDump;
    children: Array<ResumeNode>;
    css: string;
}

export default interface ResumeState {
    builtinCss: CssNode;
    specificCss: CssNode;
    children: Array<ResumeNode>;
    css: string;
    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    activeTemplate?: string;
    clipboard?: object;

    hoverNode?: IdType;
    selectedNode?: IdType;
}