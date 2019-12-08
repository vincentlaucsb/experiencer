import { EditorMode } from "../LoadComponent";
import { SectionHeaderPosition } from "../Section";
import { SelectedNodeProps } from "../ResumeComponent";

export interface ResumeSaveData {
    children: Array<object>;
    css: string;
}

export default interface ResumeState extends ResumeSaveData {
    /** Set of nodes we are currently hovering over */
    hovering: Set<string>;

    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    activeTemplate?: string;
    clipboard?: object;

    /** Unselect the currently selected node */
    selectedNode?: SelectedNodeProps;
}