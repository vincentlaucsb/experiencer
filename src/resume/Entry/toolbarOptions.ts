import { ToolbarItemData } from "@/types/toolbar";

export default function getEntryToolbarOptions(
    node: any,
    updateNode: (key: string, value: any) => void
): ToolbarItemData[] {
    const addLineBreak = (node: any) => {
        if (node.subtitle) {
            let arr = node.subtitleBreaks || [];
            arr.push(node.subtitle.length - 1);
            return arr;
        }
        return [];
    };

    const removeLineBreak = (node: any) => {
        if (node.subtitleBreaks) {
            return node.subtitleBreaks.slice(0, node.subtitleBreaks.length - 1);
        }
        return [];
    };

    const addTitleField = (node: any) => {
        let arr = node.title || [];
        arr.push('');
        return arr;
    };

    const addSubtitleField = (node: any) => {
        let arr = node.subtitle || [];
        arr.push('');
        return arr;
    };

    return [
        {
            text: 'Title Options',
            items: [
                {
                    text: 'Add title field',
                    action: () => updateNode('title', addTitleField(node))
                },
                {
                    text: 'Add subtitle field',
                    action: () => updateNode('subtitle', addSubtitleField(node))
                },
                {
                    text: 'Add subtitle line break',
                    action: () => updateNode('subtitleBreaks', addLineBreak(node))
                },
                {
                    text: 'Remove subtitle line break (from right)',
                    action: () => updateNode('subtitleBreaks', removeLineBreak(node))
                }
            ]
        }
    ];
}
