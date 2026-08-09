import { NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";
import { BasicDescriptionItemProps, DescriptionListItemType } from "./index";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { assignIds } from "@/shared/utils/assignIds";

export default function getDescriptionListItemToolbarOptions(
    updateNode: (key: string, value: NodeProperty) => void,
    node: ResumeNode
): ToolbarItemData[] {
    const addDefinition = (node: BasicDescriptionItemProps) => {
        return [...(node.definitions || []), ''];
    };

    const addTerm = () => {
        const parentUuid = resumeNodeStore.getParentUuids(node.uuid)[0];
        if (!parentUuid) return;

        resumeNodeStore.addNode(parentUuid, assignIds({
            type: DescriptionListItemType,
            value: '',
            definitions: ['']
        }));
    };

    return [
        {
            text: 'Add Term',
            onClick: addTerm
        },
        {
            text: 'Add Definition',
            onClick: () => updateNode('definitions', addDefinition(node as BasicDescriptionItemProps))
        }
    ];
}
