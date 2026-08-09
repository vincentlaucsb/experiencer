import React, { useRef, useEffect, useState, useCallback } from "react";

import "./TopEditingBar.scss";

import { SelectedNodeActions } from "../SelectedNodeActions";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import { assignIds } from "@/shared/utils/assignIds";
import Grid from "@/resume/Grid";
import Row from "@/resume/Row";
import Section from "@/resume/Section";
import PageBreak from "@/resume/PageBreak";
import { Action, AddChild, NodeProperty, ResumeNode } from "@/types";
import PageSize from "@/types/PageSize";
import Toolbar, { ToolbarSection } from "../toolbar/ToolbarMaker";
import type { ToolbarData } from "../toolbar/ToolbarMaker";
import Column from "@/resume/Column";
import getClipboardMenu from "./clipboardMenu";
import { addOptions, hasChildInsertOptions } from "./insertOptions";
import { getPageSetupSection } from "./pageSetup";

// Lazy-load HtmlIdAdder since it's only shown when user clicks the ID/Classes button
const HtmlIdAdder = React.lazy(() => import("../HtmlIdAdder"));
import { ToolbarItemData } from "../toolbar/ToolbarButton";
import { useEditorStore, useHasUnsavedPageSizeChanges } from "@/shared/stores/editorStore";
import { resumeNodeStore, useResumeNodeByUuid, useHasUnsavedChanges as useHasUnsavedNodeChanges } from "@/shared/stores/resumeNodeStore";
import { useHistoryStore } from "@/shared/stores/historyStore";
import { saveLocal } from "@/shared/stores/saveResume";
import { useHasUnsavedChanges as useHasUnsavedCssChanges } from "@/shared/stores/cssStoreHooks";
import addCssClasses from "@/shared/stores/resumeStore/addCssClasses";
import useSelectedNodeActions from "@/shared/hooks/useSelectedNodeActions";
import addHtmlId from "@/shared/stores/addHtmlId";
import ensureCssNodeForType from "@/shared/stores/ensureCssNodeForType";
import { ResumeHotKeyMap } from "../ResumeHotkeys";

const RESIZE_DEBOUNCE_MS = 120;
const EXPANSION_BUFFER_PX = 24;

interface EditingBarSubProps extends EditingBarProps {
    selectedNode: ResumeNode | undefined;
}

function SelectedNodeToolbar(props: EditingBarSubProps) {
    const { selectedNode } = props;
    
    if (selectedNode) {
        const type = selectedNode.type;
        let moveUpText = "rounded-up";
        let moveDownText = "rounded-down";

        const childTypes = ComponentTypes.instance.childTypes(type);
        const canInsertChildren = hasChildInsertOptions(childTypes);
        const htmlId = selectedNode.htmlId ? `#${selectedNode.htmlId}` : 'CSS';

        if (type === Column.type) {
            moveUpText = "rounded-left";
            moveDownText = "rounded-right";
        }

        return new Map<string, ToolbarSection>([
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
                        icon: 'ui-delete',
                        text: 'Delete',
                        condensedButton: true
                    },
                    {
                        icon: 'clip-board',
                        text: 'Clipboard',
                        condensedButton: true,
                        items: getClipboardMenu(props),
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

function getEditingSection(
    props: EditingBarProps,
    pageSize?: PageSize
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

    return items;
}

/** A responsive top editing bar */
export function TopEditingBar(props: EditingBarProps) {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const resizeTimerRef = useRef<number | undefined>(undefined);
    const continueExpansionRef = useRef(false);
    const expandedSectionWidthsRef = useRef(new Map<string, number>());
    const [collapsedSections, setCollapsedSections] = useState<ReadonlySet<string>>(new Set());
    
    // Subscribe to store changes - these will cause re-renders
    const selectedNodeId = useEditorStore(state => state.selectedNodeId);
    const pageSize = useEditorStore(state => state.pageSize);
    const setPageSize = useEditorStore(state => state.setPageSize);
    const selectedNode = useResumeNodeByUuid(selectedNodeId || '');

    const updateResizer = useCallback((allowExpansion = false) => {
        const container = toolbarRef.current;
        if (container) {
            const sectionElements = Array.from(
                container.querySelectorAll<HTMLElement>("[data-toolbar-section]")
            );
            const availableSections = new Set(
                sectionElements
                    .map((section) => section.dataset.toolbarSection)
                    .filter((key): key is string => Boolean(key))
            );
            const staleSections = [...collapsedSections].filter(
                (key) => !availableSections.has(key)
            );

            if (staleSections.length > 0) {
                setCollapsedSections((current) => {
                    const next = new Set(current);
                    staleSections.forEach((key) => next.delete(key));
                    return next;
                });
                return;
            }

            sectionElements.forEach((section) => {
                const key = section.dataset.toolbarSection;
                if (!key) {
                    return;
                }

                const width = Math.max(
                    section.offsetWidth,
                    section.getBoundingClientRect().width
                );
                if (!collapsedSections.has(key) && width > 0) {
                    expandedSectionWidthsRef.current.set(key, width);
                }
            });

            const isOverflowing = container.scrollWidth > container.clientWidth;

            if (isOverflowing) {
                const nextSection = sectionElements
                    .filter((section) => !collapsedSections.has(section.dataset.toolbarSection || ""))
                    .sort((left, right) => (
                        Number(left.dataset.toolbarCollapsePriority || 50)
                        - Number(right.dataset.toolbarCollapsePriority || 50)
                    ))[0];

                if (nextSection?.dataset.toolbarSection) {
                    setCollapsedSections((current) => new Set([
                        ...current,
                        nextSection.dataset.toolbarSection!
                    ]));
                }
            }
            else if (allowExpansion && collapsedSections.size > 0) {
                const sectionToExpand = sectionElements
                    .filter((section) => collapsedSections.has(section.dataset.toolbarSection || ""))
                    .sort((left, right) => (
                        Number(right.dataset.toolbarCollapsePriority || 50)
                        - Number(left.dataset.toolbarCollapsePriority || 50)
                    ))[0];

                const sectionKey = sectionToExpand?.dataset.toolbarSection;
                const expandedWidth = sectionKey
                    ? expandedSectionWidthsRef.current.get(sectionKey)
                    : undefined;
                const collapsedWidth = sectionToExpand
                    ? Math.max(
                        sectionToExpand.offsetWidth,
                        sectionToExpand.getBoundingClientRect().width
                    )
                    : 0;
                const widthToRecover = Math.max(
                    EXPANSION_BUFFER_PX,
                    (expandedWidth || collapsedWidth) - collapsedWidth + EXPANSION_BUFFER_PX
                );
                const availableWidth = container.clientWidth - container.scrollWidth;

                if (sectionKey && availableWidth >= widthToRecover) {
                    continueExpansionRef.current = true;
                    setCollapsedSections((current) => {
                        const next = new Set(current);
                        next.delete(sectionKey);
                        return next;
                    });
                }
            }
        }
    }, [collapsedSections]);

    useEffect(() => {
        const handleResize = () => {
            if (resizeTimerRef.current !== undefined) {
                window.clearTimeout(resizeTimerRef.current);
            }

            resizeTimerRef.current = window.setTimeout(() => {
                resizeTimerRef.current = undefined;
                updateResizer(true);
            }, RESIZE_DEBOUNCE_MS);
        };

        window.addEventListener("resize", handleResize);
        const continueExpansion = continueExpansionRef.current;
        continueExpansionRef.current = false;
        updateResizer(continueExpansion); // Initial/layout resize

        return () => {
            window.removeEventListener("resize", handleResize);
            if (resizeTimerRef.current !== undefined) {
                window.clearTimeout(resizeTimerRef.current);
                resizeTimerRef.current = undefined;
            }
        };
    }, [updateResizer]);

    // Update overflow when selection changes
    useEffect(() => {
        updateResizer(true);
        // The resize effect handles recalculation after collapse state changes.
        // This effect only needs to run when the selected node changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNodeId]);

    let data = new Map<string, ToolbarSection>([
        ["Editing", {
            icon: 'ui-edit',
            collapsePriority: 100,
            items: getEditingSection(props, selectedNode ? pageSize : undefined)
        }],
    ]);

    if (selectedNode) {
        let selectedNodeOptions = SelectedNodeToolbar({
            ...props,
            selectedNode
        });

        selectedNodeOptions.forEach((value, key) => {
            data.set(key, value);
        });
    }
    else {
        data.set(
            "Page Setup",
            getPageSetupSection(pageSize, setPageSize, collapsedSections.has("Page Setup"))
        );

        data.set("Clipboard", {
            icon: "clip-board",
            items: [{
                onClick: props.pasteClipboard,
                icon: "ui-clip-board",
                text: "Paste",
                shortcut: ResumeHotKeyMap.PASTE_SELECTED["sequence"]
            }]
        });

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

    props.additionalToolbarSections?.forEach((section, key) => {
        data.set(key, section);
    });

    const children = <Toolbar
        data={data}
        collapse={false}
        collapsedSections={collapsedSections}
    />;
    const className = collapsedSections.size > 0 ? "toolbar-has-collapsed-sections" : "";
    return <div ref={toolbarRef} id="toolbar" className={className}>{children}</div>;
}

export interface TopEditingBarWrapperProps {
    saveLocal?: Action;
    additionalToolbarSections?: ToolbarData;
}

export default function TopEditingBarWrapper(props: TopEditingBarWrapperProps) {
    const { canUndo, canRedo, undo, redo } = useHistoryStore.getState();
    const { unselectNode, selectedNodeId } = useEditorStore.getState();
    const hasUnsavedNodeChanges = useHasUnsavedNodeChanges();
    const hasUnsavedCssChanges = useHasUnsavedCssChanges();
    const hasUnsavedPageSizeChanges = useHasUnsavedPageSizeChanges();
    const unsavedChanges = hasUnsavedNodeChanges
        || hasUnsavedCssChanges
        || hasUnsavedPageSizeChanges;
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
        addChild: (parentUuid: string | undefined, node: ResumeNode) => {
            if (!resumeNodeStore.canAddNode(parentUuid, node)) {
                resumeNodeStore.addNode(parentUuid, node);
                return;
            }

            resumeNodeStore.addNode(parentUuid, node);
        },
        unselect: unselectNode,
        updateSelected: (key: string, data: NodeProperty) => {
            if (!selectedNodeId) {
                return;
            }

            resumeNodeStore.updateNode(selectedNodeId, key, data);
        },
        saveLocal: props.saveLocal ?? (unsavedChanges ? saveLocal : undefined),
    };

    return <TopEditingBar {...wrappedProps} />
}
