﻿import Entry, { BasicEntryProps } from "../Entry";
import Row, { BasicRowProps } from "../Row";
import Header from "../Header";
import Icon from "../Icon";
import { ResumeNode, NodeProperty } from "../utility/Types";
import { ToolbarSection, ToolbarItemData } from "../controls/toolbar/ToolbarMaker";

/**
 * Retrieves custom toolbar options for a node
 * @param type
 * @param node
 * @param updateNode
 */
export default function toolbarOptions(
    node: ResumeNode,
    updateNode: (key: string, value: NodeProperty) => void):
    ToolbarItemData[]
{
    const addLineBreak = (node: BasicEntryProps) => {
        if (node.subtitle) {
            let arr = node.subtitleBreaks || [];
            arr.push(node.subtitle.length - 1);
            return arr;
        }

        return [];
    }

    const addTitleField = (node: BasicEntryProps) => {
        let arr = node.title || [];
        arr.push('');
        return arr;
    }

    const addSubtitleField = (node: BasicEntryProps) => {
        let arr = node.subtitle || [];
        arr.push('');
        return arr;
    }

    const removeTitleField = (node: BasicEntryProps) => {
        if (node.title) {
            return node.title.slice(0, node.title.length - 1);
        }

        return [];
    };

    const removeSubtitleField = (node: BasicEntryProps) => {
        if (node.subtitle) {
            return node.subtitle.slice(0, node.subtitle.length - 1);
        }

        return [];
    };

    const justifyContent = (option: string) => updateNode('justifyContent', option);
    const justifyContentOptions = {
        text: 'Justify Content',
        items: [
            {
                text: 'Space between',
                action: () => justifyContent('space-between')
            },
            {
                text: 'Stack at beginning',
                action: () => justifyContent('flex-start')
            },
            {
                text: 'Stack at end',
                action: () => justifyContent('flex-end')
            },
            {
                text: 'Stack center',
                action: () => justifyContent('center')
            },
            {
                text: 'Space around',
                action: () => justifyContent('space-around')
            },
            {
                text: 'Space evenly',
                action: () => justifyContent('space-evenly')
            }
        ]
    };

    switch (node.type) {
        case Entry.type:
            return [
                {
                    text: 'Title Options',
                    items: [
                        {
                            text: 'Add title field',
                            action: () =>
                                updateNode('title', addTitleField(node))
                        },
                        {
                            text: 'Add subtitle field',
                            action: () =>
                                updateNode('subtitle', addSubtitleField(node))
                        },
                        {
                            text: 'Add subtitle line break',
                            action: () =>
                                updateNode('subtitleBreaks', addLineBreak(node))
                        },
                        {
                            text: 'Remove title field (from right)',
                            action: () => updateNode('title', removeTitleField(node)),
                        },
                        {
                            text: 'Remove subtitle field (from right)',
                            action: () => updateNode('subtitle', removeSubtitleField(node))
                        }
                    ]
                }
            ];

        case Header.type:
            const distribute = (value: string) => updateNode('distribution', value);

            return [
                {
                    text: `Distribute Items`,
                    items: [
                        {
                            text: 'Top-to-Bottom',
                            action: () => distribute('top-to-bottom')
                        },
                        {
                            text: 'Bottom-to-Top',
                            action: () => distribute('bottom-to-top')
                        },
                        {
                            text: 'Left-to-Right',
                            action: () => distribute('left-to-right')
                        },
                        {
                            text: 'Right-to-Left',
                            action: () => distribute('right-to-left')
                        }
                    ]
                },
                justifyContentOptions
            ]

        case Icon.type:
            return [
                {
                    text: 'GitHub',
                    action: () => updateNode('icon', 'github')
                }
            ];

        case Row.type:
            const rowNode = node as BasicRowProps;
            return [
                {
                    text: 'Reverse Contents',
                    action: () => updateNode('reverseDirection', !rowNode.reverseDirection || false)
                },
                justifyContentOptions
            ];

        default:
            return [];
    }
}