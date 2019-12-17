import { EditorMode } from "../ResumeComponent";
import { SectionHeaderPosition } from "../Section";
import { IdType } from "../utility/HoverTracker";
import { CustomToolbarOptions } from "../ResumeNodeBase";

export interface ResumeSaveData {
    children: Array<object>;
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