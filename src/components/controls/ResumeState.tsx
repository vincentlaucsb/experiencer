import { EditorMode } from "../LoadComponent";
import { SectionHeaderPosition } from "../Section";
import { SelectedNodeProps } from "../ResumeComponent";

export default interface ResumeState {
    children: Array<object>;
    customCss: string;

    /** Set of nodes we are currently hovering over */
    hovering: Set<string>;

    mode: EditorMode;
    sectionTitlePosition: SectionHeaderPosition;

    activeTemplate?: string;
    clipboard?: object;

    /** Unselect the currently selected node */
    selectedNode?: SelectedNodeProps;
}