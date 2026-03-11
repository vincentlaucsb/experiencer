import getJustifyContentOptions from "../helpers/getJustifyContentOptions";

export default function getToolbarOptions(updateNode: (key: string, value: any) => void) {
    const justifyContentOptions = getJustifyContentOptions(updateNode);
    const distribute = (value: string) => updateNode('distribution', value);

    return [
        {
            text: `Distribute Items`,
            items: [
                {
                    text: 'Top-to-Bottom',
                    onClick: () => distribute('top-to-bottom')
                },
                {
                    text: 'Bottom-to-Top',
                    onClick: () => distribute('bottom-to-top')
                },
                {
                    text: 'Left-to-Right',
                    onClick: () => distribute('left-to-right')
                },
                {
                    text: 'Right-to-Left',
                    onClick: () => distribute('right-to-left')
                }
            ]
        },
        justifyContentOptions
    ]
}