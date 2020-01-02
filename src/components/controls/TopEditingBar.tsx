import React from "react";
import { SelectedNodeActions } from "./SelectedNodeActions";
import { assignIds } from "../Helpers";
import ComponentTypes from "../schema/ComponentTypes";
import Grid from "../Grid";
import Row from "../Row";
import Section from "../Section";
import { Action, IdType, NodeProperty, ResumeNode, AddChild } from "../utility/Types";
import SelectedNodeToolbar from "./toolbar/SelectedNodeToolbar";
import ToolbarMaker, { ToolbarSection } from "./toolbar/ToolbarMaker";

interface EditingSectionProps {
    saveLocal: Action;
    undo?: Action;
    redo?: Action;
}

export interface EditingBarProps extends SelectedNodeActions, EditingSectionProps {
    selectedNodeId?: IdType;
    selectedNode?: ResumeNode,
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;

    addChild: AddChild;
    updateSelected: (key: string, data: NodeProperty) => void;
    unselect: Action;
}

export default function TopEditingBar(props: EditingBarProps) {
    let toolbarRef = React.createRef<HTMLDivElement>();
    let [isOverflowing, setOverflowing] = React.useState(false);

    // The breakpoint at which toolbar begins to overflow
    let [overflowWidth, setOverflowWidth] = React.useState(-1);

    const updateResizer = (event) => {
        if (toolbarRef.current) {
            if ((toolbarRef.current.scrollWidth > toolbarRef.current.clientWidth) ||
                window.innerWidth < overflowWidth) {
                if (overflowWidth < 0) {
                    setOverflowWidth(toolbarRef.current.scrollWidth);
                }
                setOverflowing(true);
            }
            else {
                setOverflowing(false);
            }
        }
    };

    window.addEventListener("resize", updateResizer);

    let editingSection: ToolbarSection = [
        {
            action: props.saveLocal,
            icon: "icofont-save"
        },
        {
            action: props.undo,
            icon: "icofont-undo"
        },
        {
            action: props.redo,
            icon: "icofont-redo"
        }
    ];

    let data = new Map<string, ToolbarSection>([
        ["Editing", editingSection],
        ["Resume Components", [
            {
                action: () => props.addChild([], assignIds({ type: Section.type })),
                icon: "icofont-book-mark",
                text: "Add Section"
            },
            {
                action: () => props.addChild([], assignIds(ComponentTypes.defaultValue(Row.type).node)),
                icon: "icofont-swoosh-right",
                text: "Add Rows & Columns"
            },
            {
                action: () => props.addChild([], assignIds(ComponentTypes.defaultValue(Grid.type).node)),
                icon: "icofont-table",
                text: "Add Grid"
            }
        ]]
    ]);

    const id = props.selectedNodeId;
    if (id && props.selectedNode) {
        data.delete("Resume Components");

        let selectedNodeOptions = SelectedNodeToolbar({
            ...props,
            isOverflowing: isOverflowing
        });

        selectedNodeOptions.forEach((value, key) => {
            data.set(key, value);
        });
    }

    let children = <ToolbarMaker data={data} />;

    return <div ref={toolbarRef} id="toolbar">{children}</div>
}