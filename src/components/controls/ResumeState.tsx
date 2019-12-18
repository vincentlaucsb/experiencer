import { EditorMode } from "../ResumeComponent";
import { SectionHeaderPosition } from "../Section";
import { IdType } from "../utility/HoverTracker";
import { CustomToolbarOptions } from "../ResumeNodeBase";
import { BasicResumeNode } from "../utility/NodeTree";

export interface ResumeSaveData {
    children: Array<BasicResumeNode>;
    css: string;
}

export default interface ResumeState extends ResumeSaveData {
    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    activeTemplate?: string;
    clipboard?: object;

    hoverNode?: IdType;
    selectedNode?: IdType;
    selectedNodeCustomOptions?: CustomToolbarOptions;
}