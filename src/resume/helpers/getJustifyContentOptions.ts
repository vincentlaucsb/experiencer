export default function getJustifyContentOptions(updateNode: (key: string, value: any) => void) {
    const justifyContent = (option: string) => updateNode('justifyContent', option);
    
    return {
        text: 'Justify Content',
        items: [
            {
                text: 'Space between',
                onClick: () => justifyContent('space-between')
            },
            {
                text: 'Stack at beginning',
                onClick: () => justifyContent('flex-start')
            },
            {
                text: 'Stack at end',
                onClick: () => justifyContent('flex-end')
            },
            {
                text: 'Stack center',
                onClick: () => justifyContent('center')
            },
            {
                text: 'Space around',
                onClick: () => justifyContent('space-around')
            },
            {
                text: 'Space evenly',
                onClick: () => justifyContent('space-evenly')
            }
        ]
    };
}