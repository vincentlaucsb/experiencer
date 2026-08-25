import React from "react";

import Column from "@/resume/Column";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import type { ResumeNode } from "@/types";
import type { ToolbarData } from "@/controls/toolbar/ToolbarMaker";

import getClipboardMenu from "./clipboardMenu";
import { addOptions, hasChildInsertOptions } from "./insertOptions";
import type { EditingBarProps } from "./types";

const HtmlIdAdder = React.lazy(() => import("../HtmlIdAdder"));

/** Projects the toolbar sections owned by the active résumé-node selection. */
export function projectSelectedNodeSections(
    props: EditingBarProps,
    selectedNode: ResumeNode
): ToolbarData {
    const type = selectedNode.type;
    const childTypes = ComponentTypes.instance.childTypes(type);
    const canInsertChildren = hasChildInsertOptions(childTypes);
    const htmlId = selectedNode.htmlId ? `#${selectedNode.htmlId}` : "CSS";
    const moveUpIcon = type === Column.type ? "rounded-left" : "rounded-up";
    const moveDownIcon = type === Column.type ? "rounded-right" : "rounded-down";

    return new Map([
        [`Current Node (${selectedNode.type})`, {
            icon: "gear",
            items: [
                ...(canInsertChildren ? [addOptions({
                    id: selectedNode.uuid,
                    addChild: props.addChild,
                    options: childTypes,
                    parentNode: selectedNode
                })] : []),
                {
                    onClick: props.delete,
                    icon: "ui-delete",
                    text: "Delete",
                    condensedButton: true
                },
                {
                    icon: "clip-board",
                    text: "Clipboard",
                    condensedButton: true,
                    items: getClipboardMenu(props)
                },
                ...ComponentTypes.instance.toolbarOptions(selectedNode, props.updateSelected),
                {
                    onClick: props.unselect,
                    text: "Unselect"
                }
            ]
        }],
        ["Move", {
            icon: "drag2",
            items: [
                {
                    onClick: props.moveUp,
                    icon: moveUpIcon,
                    text: "Move Up",
                    condensedButton: true
                },
                {
                    onClick: props.moveDown,
                    icon: moveDownIcon,
                    text: "Move Down",
                    condensedButton: true
                }
            ]
        }],
        [htmlId, {
            icon: "ui-tag",
            items: [{
                content: (
                    <React.Suspense fallback={null}>
                        <HtmlIdAdder
                            key={selectedNode.uuid}
                            htmlId={selectedNode.htmlId}
                            cssClasses={selectedNode.classNames}
                            addHtmlId={props.addHtmlId}
                            addCssClasses={props.addCssClasses}
                        />
                    </React.Suspense>
                )
            }]
        }]
    ]);
}
