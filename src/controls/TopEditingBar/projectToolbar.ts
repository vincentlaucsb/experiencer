import type { ToolbarData, ToolbarSection } from "@/controls/toolbar/ToolbarMaker";

import { projectEditingItems } from "./editingSection";
import { projectRootSections } from "./rootSections";
import { projectSelectedNodeSections } from "./selectedNodeSections";
import type { TopEditingBarViewProps } from "./types";

/** Composes ordered core and extension sections for the editing toolbar view. */
export function projectToolbar(
    props: TopEditingBarViewProps,
    openSpecialCharacterPicker: () => void
): ToolbarData {
    const data = new Map<string, ToolbarSection>([
        ["Editing", {
            icon: "ui-edit",
            collapsePriority: 100,
            items: projectEditingItems(props)
        }]
    ]);
    const contextual = props.selectedNode
        ? projectSelectedNodeSections(props, props.selectedNode)
        : projectRootSections({
            props,
            pageSize: props.pageSize,
            setPageSize: props.setPageSize,
            openSpecialCharacterPicker
        });

    contextual.forEach((section, key) => data.set(key, section));
    props.additionalToolbarSections?.forEach((section, key) => data.set(key, section));
    return data;
}
