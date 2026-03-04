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
                    action: () => updateNode('icon', 'email')
                },
                {
                    icon: 'github',
                    text: 'GitHub',
                    action: () => updateNode('icon', 'github')
                },
                {
                    icon: 'globe',
                    text: 'Globe',
                    action: () => updateNode('icon', 'globe')
                },
                {
                    icon: 'linkedin',
                    text: 'LinkedIn',
                    action: () => updateNode('icon', 'linkedin')
                },
                {
                    icon: 'location-pin',
                    text: 'Map Pin',
                    action: () => updateNode('icon', 'map-pin')
                },
                {
                    icon: 'phone',
                    text: 'Phone',
                    action: () => updateNode('icon', 'phone')
                }
            ]
        }
    ];
}
