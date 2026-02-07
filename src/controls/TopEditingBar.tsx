import React, { useRef, useEffect, useState, useCallback } from "react";
import { SelectedNodeActions } from "./SelectedNodeActions";
import { assignIds } from "@/shared/utils/Helpers";
import ComponentTypes, { NodeInformation } from "@/shared/schema/ComponentTypes";
import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Section from "@/resume/Section";
import { Action, IdType, NodeProperty, ResumeNode, AddChild } from "@/types";
import Toolbar, { ToolbarSection } from "./toolbar/ToolbarMaker";
import Column from "@/resume/Column";
import toolbarOptions from "@/shared/schema/ToolbarOptions";
import HtmlIdAdder from "./HtmlIdAdder";
import ResumeHotKeys from "./ResumeHotkeys";
import { ToolbarItemData } from "./toolbar/ToolbarButton";
import { useEditorStore } from "@/shared/stores/editorStore";
import { useResumeStore } from "@/shared/stores/resumeStore";

interface AddOptionProps {
    options: string | Array<string>;
    addChild: AddChild;
    id: string | undefined;  // UUID or undefined for root
}

/**
 * Return the button or menu for adding children to a node
 * @param options
 */
function addOptions(data: AddOptionProps): ToolbarItemData {
    const options = data.options;
    const nodeInfo = (type: string) => ComponentTypes.defaultValue(type);

    if (Array.isArray(options)) {
        if (options.length === 0) {
            return {};
        }

        return {
            text: "Insert",
            icon: "ui-add",
            items: options.map((nodeType: string) => {
                const info = nodeInfo(nodeType);
                const node: NodeInformation = nodeInfo(nodeType);

                return {
                    icon: info.icon,
                    text: info.text,
                    action: () => data.addChild(data.id, assignIds(node.node))
                } as ToolbarItemData
            })
        }
    }

    const node: NodeInformation = nodeInfo(data.options as string);
    return {
        action: () => data.addChild(data.id, assignIds(node.node)),
        text: `Add ${node.text}`
    }
}

function ClipboardMenu(data: EditingBarProps): ToolbarItemData[] {
    /**
     * Get the keyboard shortcut associated with key
     * @param key Resume hotkey key
     */
    const getShortcut = (key: string): string => {
        return ResumeHotKeys.keyMap[key]['sequence'];
    }

    return [
        {
            text: 'Cut',
            icon: "ui-cut",
            action: data.cutClipboard,
            shortcut: getShortcut('CUT_SELECTED')
        },
        {
            text: 'Copy',
            icon: "ui-copy",
            action: data.copyClipboard,
            shortcut: getShortcut('COPY_SELECTED')
        },
        {
            text: 'Paste',
            icon: "ui-clip-board",
            action: data.pasteClipboard,
            shortcut: getShortcut('PASTE_SELECTED')
        }
    ];
}

interface EditingBarSubProps extends EditingBarProps {
    isOverflowing: boolean;
    selectedNode: ResumeNode | undefined;
}

function SelectedNodeToolbar(props: EditingBarSubProps) {
    const { selectedNode } = props;
    
    if (selectedNode) {
        const type = selectedNode.type;
        let moveUpText = "rounded-up";
        let moveDownText = "rounded-down";

        const childTypes = ComponentTypes.childTypes(type);
        const htmlId = selectedNode.htmlId ? `#${selectedNode.htmlId}` : 'CSS';

        if (type === Column.type) {
            moveUpText = "rounded-left";
            moveDownText = "rounded-right";
        }

        return new Map<string, ToolbarSection>([
            [`Current Node (${selectedNode.type})`, {
                icon: "gear",
                items: [
                    addOptions({
                        id: selectedNode.uuid,
                        addChild: props.addChild,
                        options: childTypes
                    }),
                    {
                        action: props.delete,
                        icon: 'ui-delete',
                        text: 'Delete',
                        condensedButton: true
                    },
                    {
                        icon: 'clip-board',
                        text: 'Clipboard',
                        condensedButton: true,
                        items: ClipboardMenu(props),
                    },
                    ...toolbarOptions(selectedNode, props.updateSelected),
                    {
                        action: props.unselect,
                        text: 'Unselect'
                    }
                ]
            }],
            ["Move", {
                icon: "drag2",
                items: [
                    {
                        action: props.moveUp,
                        icon: moveUpText,
                        text: 'Move Up',
                        condensedButton: true
                    },
                    {
                        action: props.moveDown,
                        icon: moveDownText,
                        text: 'Move Down',
                        condensedButton: true
                    }
                ]
            }],
            [htmlId, {
                icon: "ui-tag",
                items: [
                    {
                        content: <HtmlIdAdder
                            key={selectedNode.uuid}
                            htmlId={selectedNode.htmlId}
                            cssClasses={selectedNode.classNames}
                            addHtmlId={props.addHtmlId}
                            addCssClasses={props.addCssClasses} />
                    }
                ]
            }]
        ]);
    }

    return new Map<string, ToolbarSection>();
}

interface EditingSectionProps {
    saveLocal?: Action;
    undo?: Action;
    redo?: Action;
}

export interface EditingBarProps extends SelectedNodeActions, EditingSectionProps {
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;

    addChild: AddChild;
    updateSelected: (key: string, data: NodeProperty) => void;
    unselect: Action;
}

/** Screen width at which toolbar should shrink regardless of anything */
const CLIP_WIDTH = 800;

function getEditingSection(props: EditingBarProps): ToolbarItemData[] {
    return [
        {
            action: props.saveLocal,
            icon: "save",
            text: "Save",
            condensedButton: true
        },
        {
            action: props.undo,
            icon: "undo",
            text: "Undo",
            condensedButton: true
        },
        {
            action: props.redo,
            icon: "redo",
            text: "Redo",
            condensedButton: true
        }
    ];
}

/** A responsive top editing bar */
export default function TopEditingBar(props: EditingBarProps) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [overflowWidth, setOverflowWidth] = useState(-1);
    
    // Subscribe to store changes - these will cause re-renders
    const selectedNodeId = useEditorStore(state => state.selectedNodeId);
    const selectedNode = useResumeStore(state => 
        selectedNodeId ? state.getNodeByUuid(selectedNodeId) : undefined
    );

    const updateResizer = useCallback(() => {
        const container = toolbarRef.current;
        if (container) {
            // Get width of parent container
            const parentWidth = container.parentElement ?
                container.parentElement.clientWidth : window.innerWidth;

            // Case 1: Editing bar is overflowing
            // Case 2: Editing bar has been shrunk, but parent container
            //         isn't large enough for editing bar to fully expand
            // Case 3: Screen width is smaller than a certain breakpoint
            const shouldOverflow = (container.scrollWidth > container.clientWidth)
                || (parentWidth < overflowWidth)
                || (window.innerWidth < CLIP_WIDTH);

            // This sets the breakpoint at which the editing bar should collapse
            if (overflowWidth < 0 && shouldOverflow) {
                setOverflowWidth(container.scrollWidth);
            }

            setIsOverflowing(shouldOverflow);
        }
    }, [overflowWidth]);

    useEffect(() => {
        window.addEventListener("resize", updateResizer);
        updateResizer(); // Initial resize

        return () => {
            window.removeEventListener("resize", updateResizer);
        };
    }, [updateResizer]);

    // Update overflow when selection changes
    useEffect(() => {
        updateResizer();
    }, [selectedNodeId, updateResizer]);

    let data = new Map<string, ToolbarSection>([
        ["Editing", {
            icon: 'ui-edit',
            items: getEditingSection(props)
        }],
    ]);

    if (selectedNode) {
        let selectedNodeOptions = SelectedNodeToolbar({
            ...props,
            isOverflowing,
            selectedNode
        });

        selectedNodeOptions.forEach((value, key) => {
            data.set(key, value);
        });
    }
    else {
        data.set("Resume Components", {
            items: [
                {
                    action: () => props.addChild(undefined, assignIds({ type: Section.type })),
                    icon: "book-mark",
                    text: "Add Section"
                },
                {
                    action: () => props.addChild(undefined, assignIds(ComponentTypes.defaultValue(Row.type).node)),
                    icon: "swoosh-right",
                    text: "Add Rows & Columns"
                },
                {
                    action: () => props.addChild(undefined, assignIds(ComponentTypes.defaultValue(Grid.type).node)),
                    icon: "table",
                    text: "Add Grid"
                }
            ]
        });
    }

    const children = <Toolbar data={data} collapse={isOverflowing} />;
    const className = isOverflowing ? "toolbar-collapsed" : "";
    return <div ref={toolbarRef} id="toolbar" className={className}>{children}</div>;
}