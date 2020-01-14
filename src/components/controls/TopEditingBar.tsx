import React from "react";
import { SelectedNodeActions } from "./SelectedNodeActions";
import { assignIds } from "../Helpers";
import ComponentTypes, { NodeInformation } from "../schema/ComponentTypes";
import Grid from "../Grid";
import Row from "../Row";
import Section from "../Section";
import { Action, IdType, NodeProperty, ResumeNode, AddChild } from "../utility/Types";
import Toolbar, { ToolbarSection, ToolbarItemData } from "./toolbar/ToolbarMaker";
import Column from "../Column";
import toolbarOptions from "../schema/ToolbarOptions";
import HtmlIdAdder from "./HtmlIdAdder";
import ResumeHotKeys from "./ResumeHotkeys";

interface AddOptionProps {
    options: string | Array<string>;
    addChild: AddChild;
    id: IdType;
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
}

function SelectedNodeToolbar(props: EditingBarSubProps) {
    const id = props.selectedNodeId;
    if (id && props.selectedNode) {
        const type = props.selectedNode.type;
        let moveUpText = "rounded-up";
        let moveDownText = "rounded-down";

        const childTypes = ComponentTypes.childTypes(type);
        const htmlId = props.selectedNode.htmlId ? `#${props.selectedNode.htmlId}` : 'CSS';

        if (type === Column.type) {
            moveUpText = "rounded-left";
            moveDownText = "rounded-right";
        }

        return new Map<string, ToolbarSection>([
            [`Current Node (${props.selectedNode.type})`, {
                icon: "gear",
                items: [
                    addOptions({
                        id: id,
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
                    ...toolbarOptions(props.selectedNode, props.updateSelected),
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
                            key={props.selectedNode.uuid}
                            htmlId={props.selectedNode.htmlId}
                            cssClasses={props.selectedNode.classNames}
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
    selectedNodeId?: IdType;
    selectedNode?: ResumeNode,
    addHtmlId: (htmlId: string) => void;
    addCssClasses: (classes: string) => void;

    addChild: AddChild;
    updateSelected: (key: string, data: NodeProperty) => void;
    unselect: Action;
}

interface EditingBarState {
    isOverflowing: boolean;
    overflowWidth: number;
}

/** A responsive top editing bar */
export default class TopEditingBar extends React.Component<EditingBarProps, EditingBarState> {
    toolbarRef = React.createRef<HTMLDivElement>();

    constructor(props) {
        super(props);

        this.state = {
            isOverflowing: false,

            // The breakpoint at which toolbar begins to overflow
            overflowWidth: -1
        };

        this.updateResizer = this.updateResizer.bind(this);
    }

    /** Screen width at which toolbar should shrink regardless of anything */
    get clipWidth() {
        return 800;
    }

    get editingSection(): ToolbarItemData[] {
        return [
            {
                action: this.props.saveLocal,
                icon: "save",
                text: "Save",
                condensedButton: true
            },
            {
                action: this.props.undo,
                icon: "undo",
                text: "Undo",
                condensedButton: true
            },
            {
                action: this.props.redo,
                icon: "redo",
                text: "Redo",
                condensedButton: true
            }
        ];
    }

    componentDidMount() {
        window.addEventListener("resize", this.updateResizer);

        // Perform initial resize
        this.updateResizer();
    }

    componentDidUpdate(prevProps: EditingBarProps) {
        // When the selected node changes, so does the toolbar
        // which means we need to update the overflow widths
        if (prevProps.selectedNodeId !== this.props.selectedNodeId) {
            this.setState({ overflowWidth: -1 });
            this.updateResizer();
        }
    }

    /**
     * Resize the toolbar on resize
     * @param event
     */
    updateResizer() {
        const container = this.toolbarRef.current;
        if (container) {
            // Get width of parent container
            // Note: Since container.parentElement is almost always defined
            //       the fallback only exists so TypeScript doesn't yell at us
            const parentWidth = container.parentElement ?
                container.parentElement.clientWidth : window.innerWidth;

            // Case 1: Editing bar is overflowing
            // Case 2: Editing bar has been shrunk, but parent container
            //         isn't large enough for editing bar to fully expand
            // Case 3: Screen width is smaller than a certain breakpoint
            const isOverflowing = (container.scrollWidth > container.clientWidth)
                || (parentWidth < this.state.overflowWidth)
                || (window.innerWidth < this.clipWidth);

            // This sets the breakpoint at which the editing bar should
            // collapse
            if (this.state.overflowWidth < 0 && isOverflowing) {
                this.setState({ overflowWidth: container.scrollWidth });
            }

            this.setState({ isOverflowing: isOverflowing });
        }
    };

    render() {
        const props = this.props;
        const id = props.selectedNodeId;

        let data = new Map<string, ToolbarSection>([
            ["Editing", {
                icon: 'ui-edit',
                items: this.editingSection
            }],
        ]);

        if (id && props.selectedNode) {
            let selectedNodeOptions = SelectedNodeToolbar({
                ...props,
                isOverflowing: this.state.isOverflowing
            });

            selectedNodeOptions.forEach((value, key) => {
                data.set(key, value);
            });
        }
        else {
            data.set("Resume Components", {
                items: [
                    {
                        action: () => props.addChild([], assignIds({ type: Section.type })),
                        icon: "book-mark",
                        text: "Add Section"
                    },
                    {
                        action: () => props.addChild([], assignIds(ComponentTypes.defaultValue(Row.type).node)),
                        icon: "swoosh-right",
                        text: "Add Rows & Columns"
                    },
                    {
                        action: () => props.addChild([], assignIds(ComponentTypes.defaultValue(Grid.type).node)),
                        icon: "table",
                        text: "Add Grid"
                    }
                ]
            });
        }

        let children = <Toolbar data={data} collapse={this.state.isOverflowing} />;
        const className = this.state.isOverflowing ? "toolbar-collapsed" : "";
        return <div ref={this.toolbarRef} id="toolbar" className={className}>{children}</div>
    }
}