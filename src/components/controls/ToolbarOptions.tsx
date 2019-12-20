import Entry, { EntryProps, BasicEntryProps } from "../Entry";
import { ResumeNode } from "../utility/NodeTree";
import Row, { BasicRowProps } from "../Row";
import Section, { BasicSectionProps } from "../Section";
import { Action } from "../ResumeNodeBase";

export interface ToolbarOption {
    text: string;
    action?: Action;
    actions?: Array<ToolbarOption>;
}

export type CustomToolbarOptions = Array<ToolbarOption>;

/**
 * Retrieves custom toolbar options for a node
 * @param type
 * @param node
 * @param updateNode
 */
export default function toolbarOptions(
    node: ResumeNode,
    updateNode: (key: string, value: boolean | string | string[]) => void):
    CustomToolbarOptions
{

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

    switch (node.type) {
        case Entry.type:
            return [
                {
                    text: 'Title Options',
                    actions: [
                        {
                            text: 'Add another title field',
                            action: () =>
                                updateNode('title', addTitleField(node))
                        },
                        {
                            text: 'Add another subtitle field',
                            action: () =>
                                updateNode('subtitle', addSubtitleField(node))
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

        case Row.type:
            const rowNode = node as BasicRowProps;
            let columnDistribution = {
                text: 'Distribute Columns Evenly',
                action: () => updateNode('evenColumns', !rowNode.evenColumns || false)
            };

            if (rowNode.evenColumns) {
                console.log("Distribute columns automatically");
                columnDistribution.text = 'Distribute Columns Automatically';
            }

            const justifyContent = (option: string) => updateNode('justifyContent', option);

            return [
                columnDistribution,
                {
                    text: 'Justify Content',
                    actions: [
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
                }
            ];

        case Section.type:
            const sectionProps = node as BasicSectionProps;
            const flipHeader = sectionProps.headerPosition === 'top' ? {
                text: 'Header on Left',
                action: () => updateNode('headerPosition', 'left')
            } : {
                    text: 'Header on Top',
                    action: () => updateNode('headerPosition', 'top')
                };

            return [flipHeader];

        default:
            return [];
    }
}