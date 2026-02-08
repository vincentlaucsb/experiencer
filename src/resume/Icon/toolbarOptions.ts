import { NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";

export default function getIconToolbarOptions(
    updateNode: (key: string, value: NodeProperty) => void
): ToolbarItemData[] {
    return [
        {
            text: 'GitHub',
            action: () => updateNode('icon', 'github')
        }
    ];
}
