import { NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";

export default function getIconToolbarOptions(
    updateNode: (key: string, value: NodeProperty) => void
): ToolbarItemData[] {
    return [
        {
            text: 'Icon Type',
            items: [
                {
                    icon: 'email',
                    text: 'Email',
                    onClick: () => updateNode('icon', 'email')
                },
                {
                    icon: 'github',
                    text: 'GitHub',
                    onClick: () => updateNode('icon', 'github')
                },
                {
                    icon: 'globe',
                    text: 'Globe',
                    onClick: () => updateNode('icon', 'globe')
                },
                {
                    icon: 'linkedin',
                    text: 'LinkedIn',
                    onClick: () => updateNode('icon', 'linkedin')
                },
                {
                    icon: 'location-pin',
                    text: 'Map Pin',
                    onClick: () => updateNode('icon', 'map-pin')
                },
                {
                    icon: 'phone',
                    text: 'Phone',
                    onClick: () => updateNode('icon', 'phone')
                }
            ]
        }
    ];
}
