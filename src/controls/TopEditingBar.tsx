import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "./Buttons";
import { SelectedNodeActions } from "./SelectedNodeActions";
import { assignIds } from "@/shared/utils/Helpers";
import ComponentTypes, { NodeInformation } from "@/resume/schema/ComponentTypes";
import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Section from "@/resume/Section";
import PageBreak from "@/resume/PageBreak";
import { Action, IdType, NodeProperty, ResumeNode, AddChild } from "@/types";
import Toolbar, { ToolbarSection } from "./toolbar/ToolbarMaker";
import Column from "@/resume/Column";
import ResumeHotKeys, { ResumeHotKeyMap } from "./ResumeHotkeys";

// Lazy-load HtmlIdAdder since it's only shown when user clicks the ID/Classes button
const HtmlIdAdder = React.lazy(() => import("./HtmlIdAdder"));
import { ToolbarItemData } from "./toolbar/ToolbarButton";
import { useEditorStore } from "@/shared/stores/editorStore";
import { resumeNodeStore, useResumeNodeByUuid, useHasUnsavedChanges as useHasUnsavedNodeChanges } from "@/shared/stores/resumeNodeStore";
import { useHistoryStore } from "@/shared/stores/historyStore";
import updateSelected from "@/shared/stores/resumeStore/updateSelectedNode";
import { saveLocal } from "@/shared/stores/saveResume";
import { useHasUnsavedChanges as useHasUnsavedCssChanges } from "@/shared/stores/cssStoreHooks";
import addChildNode from "@/shared/stores/resumeStore/addChildNode";
import addCssClasses from "@/shared/stores/resumeStore/addCssClasses";
import useSelectedNodeActions from "@/shared/hooks/useSelectedNodeActions";
import addHtmlId from "@/shared/stores/addHtmlId";
import ensureCssNodeForType from "@/shared/stores/ensureCssNodeForType";
import PageSize from "@/types/PageSize";

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
    const nodeInfo = (type: string) => ComponentTypes.instance.defaultValue(type);

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
                    onClick: () => data.addChild(data.id, assignIds(node.node))
                } as ToolbarItemData
            })
        }
    }

    const node: NodeInformation = nodeInfo(data.options as string);
    return {
        onClick: () => data.addChild(data.id, assignIds(node.node)),
        text: `Add ${node.text}`
    }
}

function ClipboardMenu(data: EditingBarProps): ToolbarItemData[] {
    /**
     * Get the keyboard shortcut associated with key
     * @param key Resume hotkey key
     */
    const getShortcut = (key: string): string => {
        return  ResumeHotKeyMap[key]['sequence'];
    }

    return [
        {
            text: 'Cut',
            icon: "ui-cut",
            onClick: data.cutClipboard,
            shortcut: getShortcut('CUT_SELECTED')
        },
        {
            text: 'Copy',
            icon: "ui-copy",
            onClick: data.copyClipboard,
            shortcut: getShortcut('COPY_SELECTED')
        },
        {
            text: 'Paste',
            icon: "ui-clip-board",
            onClick: data.pasteClipboard,
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

        const childTypes = ComponentTypes.instance.childTypes(type);
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
                        onClick: props.delete,
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
                    ...ComponentTypes.instance.toolbarOptions(selectedNode, props.updateSelected),
                    {
                        onClick: props.unselect,
                        text: 'Unselect'
                    }
                ]
            }],
            ["Move", {
                icon: "drag2",
                items: [
                    {
                        onClick: props.moveUp,
                        icon: moveUpText,
                        text: 'Move Up',
                        condensedButton: true
                    },
                    {
                        onClick: props.moveDown,
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
                        content: <React.Suspense fallback={null}>
                            <HtmlIdAdder
                                key={selectedNode.uuid}
                                htmlId={selectedNode.htmlId}
                                cssClasses={selectedNode.classNames}
                                addHtmlId={props.addHtmlId}
                                addCssClasses={props.addCssClasses} />
                        </React.Suspense>
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

interface PageSizeControlsProps {
    pageSize: PageSize;
    setPageSize: (pageSize: PageSize) => void;
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

function PageSizeControls(props: PageSizeControlsProps) {
    const { pageSize, setPageSize } = props;

    return (
        <div className="page-size-control" role="group" aria-label="Page size">
            <span className="page-size-label">Page</span>
            <div className="page-size-toggle">
                <Button
                    className={`page-size-option${pageSize === PageSize.Letter ? ' active' : ''}`}
                    onClick={() => setPageSize(PageSize.Letter)}
                >
                    Letter
                </Button>
                <Button
                    className={`page-size-option${pageSize === PageSize.A4 ? ' active' : ''}`}
                    onClick={() => setPageSize(PageSize.A4)}
                >
                    A4
                </Button>
            </div>
        </div>
    );
}

function getEditingSection(
    props: EditingBarProps,
    pageSize: PageSize,
    setPageSize: (pageSize: PageSize) => void,
    isOverflowing: boolean
): ToolbarItemData[] {
    const items: ToolbarItemData[] = [
        {
            onClick: props.saveLocal,
            icon: "save",
            text: "Save",
            condensedButton: true
        },
        {
            onClick: props.undo,
            icon: "undo",
            text: "Undo",
            condensedButton: true
        },
        {
            onClick: props.redo,
            icon: "redo",
            text: "Redo",
            condensedButton: true
        }
    ];

    if (isOverflowing) {
        items.push({
            icon: "ui-file",
            text: "Page",
            condensedButton: true,
            items: [
                {
                    onClick: pageSize === PageSize.Letter ? undefined : () => setPageSize(PageSize.Letter),
                    text: `Letter${pageSize === PageSize.Letter ? ' ✓' : ''}`
                },
                {
                    onClick: pageSize === PageSize.A4 ? undefined : () => setPageSize(PageSize.A4),
                    text: `A4${pageSize === PageSize.A4 ? ' ✓' : ''}`
                }
            ]
        });

        return items;
    }

    items.push({
        content: <PageSizeControls pageSize={pageSize} setPageSize={setPageSize} />
    });

    return items;
}

/** A responsive top editing bar */
export function TopEditingBar(props: EditingBarProps) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isOverflowing, setIsOverflowing] = useState(false);
    const [overflowWidth, setOverflowWidth] = useState(-1);
    
    // Subscribe to store changes - these will cause re-renders
    const selectedNodeId = useEditorStore(state => state.selectedNodeId);
    const pageSize = useEditorStore(state => state.pageSize);
    const setPageSize = useEditorStore(state => state.setPageSize);
    const selectedNode = useResumeNodeByUuid(selectedNodeId || '');

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
            items: getEditingSection(props, pageSize, setPageSize, isOverflowing)
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
                    onClick: () => props.addChild(undefined, assignIds({ type: Section.type })),
                    icon: "book-mark",
                    text: "Add Section"
                },
                {
                    onClick: () => {
                        props.addChild(undefined, assignIds(ComponentTypes.instance.defaultValue(PageBreak.type).node));
                        ensureCssNodeForType(PageBreak.type);
                    },
                    icon: "page-break",
                    text: "Add Page Break"
                },
                {
                    onClick: () => props.addChild(undefined, assignIds(ComponentTypes.instance.defaultValue(Row.type).node)),
                    icon: "swoosh-right",
                    text: "Add Rows"
                },
                {
                    onClick: () => props.addChild(undefined, assignIds(ComponentTypes.instance.defaultValue(Column.type).node)),
                    icon: "swoosh-down",
                    text: "Add Columns"
                },
                {
                    onClick: () => props.addChild(undefined, assignIds(ComponentTypes.instance.defaultValue(Grid.type).node)),
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

export type TopEditingBarWrapperProps = Record<string, never>;

export default function TopEditingBarWrapper(props: TopEditingBarWrapperProps) {
    const { canUndo, canRedo, undo, redo } = useHistoryStore.getState();
    const { unselectNode, selectedNodeId } = useEditorStore.getState();
    const hasUnsavedNodeChanges = useHasUnsavedNodeChanges();
    const hasUnsavedCssChanges = useHasUnsavedCssChanges();
    const unsavedChanges = hasUnsavedNodeChanges || hasUnsavedCssChanges;
    const tree = resumeNodeStore.data;
    const selectedNodeActions = useSelectedNodeActions();

    const undoRedoProps =  {
        undo: canUndo() ? undo : undefined,
        redo: canRedo() ? redo : undefined
    };

    const wrappedProps = {
        ...props,
        ...selectedNodeActions,
        ...undoRedoProps,
        addHtmlId,
        addCssClasses: (classes: string) => {
            const selectedNode = selectedNodeId ? tree.getNodeByUuid(selectedNodeId) : undefined;
            addCssClasses(selectedNode, classes);
        },
        addChild: addChildNode,
        unselect: unselectNode,
        updateSelected: (key: string, data: NodeProperty) => {
            updateSelected(selectedNodeId, key, data);
        },
        saveLocal: unsavedChanges ? saveLocal : undefined,
    };

    return <TopEditingBar {...wrappedProps} />
}