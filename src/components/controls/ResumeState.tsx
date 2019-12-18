import { EditorMode } from "../ResumeComponent";
import { SectionHeaderPosition } from "../Section";
import { IdType } from "../utility/HoverTracker";
import { CustomToolbarOptions } from "../ResumeNodeBase";
import { BasicResumeNode, ResumeNode } from "../utility/NodeTree";
import { CssNodeDump } from "../utility/CssTree";

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    children: Array<ResumeNode>;
    css: string;
}

export default interface ResumeState {
    children: Array<ResumeNode>;
    css: string;
    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    activeTemplate?: string;
    clipboard?: object;

    hoverNode?: IdType;
    selectedNode?: IdType;
    selectedNodeCustomOptions?: CustomToolbarOptions;
}