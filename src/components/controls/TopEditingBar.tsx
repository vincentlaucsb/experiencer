import React from "react";
import { SelectedNodeActions } from "./SelectedNodeActions";
import { assignIds } from "../Helpers";
import ComponentTypes from "../schema/ComponentTypes";
import Grid from "../Grid";
import Row from "../Row";
import Section from "../Section";
import { Action, IdType, NodeProperty, ResumeNode, AddChild } from "../utility/Types";
import SelectedNodeToolbar from "./toolbar/SelectedNodeToolbar";
import Toolbar, { ToolbarSection, ToolbarItemData } from "./toolbar/ToolbarMaker";

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
            const isOverflowing = (container.scrollWidth > container.clientWidth)
                || (parentWidth < this.state.overflowWidth);

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