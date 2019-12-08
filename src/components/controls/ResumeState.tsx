import { EditorMode } from "../LoadComponent";
import { SectionHeaderPosition } from "../Section";
import { SelectedNodeProps } from "../ResumeComponent";

export default interface ResumeState {
    children: Array<object>;
    clipboard?: object;
    customCss: string;

    /** Set of nodes we are currently hovering over */
    hovering: Set<string>;

    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    /** Unselect the currently selected node */
    selectedNode?: SelectedNodeProps;
    activeTemplate?: string;
}