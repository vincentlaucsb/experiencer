import { EditorMode } from "../ResumeComponent";
import { SectionHeaderPosition } from "../Section";
import { IdType } from "../utility/HoverTracker";
import { ResumeNode } from "../utility/NodeTree";
import CssNode, { CssNodeDump } from "../utility/CssTree";

export interface ResumeSaveData {
    builtinCss: CssNodeDump;
    children: Array<ResumeNode>;
    css: string;
    sectionTitlePosition?: 'top' | 'left';
}

export default interface ResumeState {
    css: CssNode;
    children: Array<ResumeNode>;
    additionalCss: string;
    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    activeTemplate?: string;
    clipboard?: object;

    hoverNode?: IdType;
    selectedNode?: IdType;
}