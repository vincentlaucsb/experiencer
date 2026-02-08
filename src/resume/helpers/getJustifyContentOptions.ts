export default function getJustifyContentOptions(updateNode: (key: string, value: any) => void) {
    const justifyContent = (option: string) => updateNode('justifyContent', option);
    
    return {
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
}