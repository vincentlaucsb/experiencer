import { NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";
import { BasicRowProps } from "./index";
import getJustifyContentOptions from "@/resume/helpers/getJustifyContentOptions";

export default function getRowToolbarOptions(
    updateNode: (key: string, value: NodeProperty) => void,
    node: ResumeNode
): ToolbarItemData[] {
    const rowNode = node as BasicRowProps;
    const justifyContentOptions = getJustifyContentOptions(updateNode);

    return [
        {
            text: 'Reverse Contents',
            onClick: () => updateNode('reverseDirection', !rowNode.reverseDirection || false)
        },
        justifyContentOptions
    ];
}
