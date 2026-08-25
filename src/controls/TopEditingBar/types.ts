import type { SelectedNodeActions } from "@/controls/SelectedNodeActions";
import type { ToolbarData } from "@/controls/toolbar/ToolbarMaker";
import type { Action, AddChild, NodeProperty, ResumeNode } from "@/types";
import type PageSize from "@/types/PageSize";

export interface EditingSectionProps {
    saveLocal?: Action;
    undo?: Action;
    redo?: Action;
    /** Additional product-owned sections appended after the editor controls. */
    additionalToolbarSections?: ToolbarData;
}

export interface EditingBarProps extends SelectedNodeActions, EditingSectionProps {
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;
    addChild: AddChild;
    updateSelected: (key: string, data: NodeProperty) => void;
    unselect: Action;
}

export interface TopEditingBarViewProps extends EditingBarProps {
    pageSize: PageSize;
    selectedNode?: ResumeNode;
    setPageSize: (pageSize: PageSize) => void;
}

export interface TopEditingBarWrapperProps {
    saveLocal?: Action;
    additionalToolbarSections?: ToolbarData;
}
