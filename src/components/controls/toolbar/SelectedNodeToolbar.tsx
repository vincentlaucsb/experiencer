import { EditingBarProps } from "../TopEditingBar";
import toolbarOptions from "src/components/schema/ToolbarOptions";
import ComponentTypes, { NodeInformation } from "src/components/schema/ComponentTypes";
import React from "react";
import { AddChild, IdType } from "src/components/utility/Types";
import Column from "src/components/Column";
import HtmlIdAdder from "../HtmlIdAdder";
import { assignIds } from "src/components/Helpers";
import ResumeHotKeys from "../ResumeHotkeys";
import { ToolbarSection, ToolbarItemData } from "./ToolbarMaker";

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

export default function SelectedNodeToolbar(props: EditingBarSubProps) {
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