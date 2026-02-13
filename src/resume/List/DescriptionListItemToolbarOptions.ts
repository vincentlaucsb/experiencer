import { NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";
import { BasicDescriptionItemProps } from "./index";

export default function getDescriptionListItemToolbarOptions(
    updateNode: (key: string, value: NodeProperty) => void,
    node: ResumeNode
): ToolbarItemData[] {
    const addDefinition = (node: BasicDescriptionItemProps) => {
        let arr = node.definitions || [];
        arr.push('');
        return arr;
    };

    return [
        {
            text: 'Add Definition',
            action: () => updateNode('definitions', addDefinition(node as BasicDescriptionItemProps))
        }
    ];
}
