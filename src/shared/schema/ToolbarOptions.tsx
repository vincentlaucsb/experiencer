import Entry from "@/resume/Entry";
import Row, { BasicRowProps } from "@/resume/Row";
import Header from "@/resume/Header";
import Link from "@/resume/Link";
import { IconType } from "@/resume/Icon";
import { ResumeNode, NodeProperty } from "@/types";
import { BasicDescriptionItemProps, DescriptionListItemType } from "@/resume/List";
import { ToolbarItemData } from "@/types/toolbar";
import UrlInput from "@/controls/inputs/UrlInput";
import getJustifyContentOptions from "@/resume/helpers/getJustifyContentOptions";
import getHeaderToolbarOptions from "@/resume/Header/toolbarOptions";
import getEntryToolbarOptions from "@/resume/Entry/toolbarOptions";

/**
 * Retrieves custom toolbar options for a node
 * @param node
 * @param updateNode
 */
export default function toolbarOptions(
    node: ResumeNode,
    updateNode: (key: string, value: NodeProperty) => void
): ToolbarItemData[] {
    const justifyContentOptions = getJustifyContentOptions(updateNode);

    switch (node.type) {
        case DescriptionListItemType:
            const addDefinition = (node: BasicDescriptionItemProps) => {
                let arr = node.definitions || [];
                arr.push('');
                return arr;
            };

            return [
                {
                    text: 'Add Definition',
                    action: () => updateNode('definitions', addDefinition(node))
                }
            ];

        case Entry.type:
            return getEntryToolbarOptions(node, updateNode);

        case Header.type:
            return getHeaderToolbarOptions(updateNode);

        case IconType:
            return [
                {
                    text: 'GitHub',
                    action: () => updateNode('icon', 'github')
                }
            ];

        case Link.type:
            return [
                {
                    content: <UrlInput
                        url={(node as any).url}
                        onChange={(url) => updateNode('url', url)}
                    />
                }
            ];

        case Row.type:
            const rowNode = node as BasicRowProps;
            return [
                {
                    text: 'Reverse Contents',
                    action: () => updateNode('reverseDirection', !rowNode.reverseDirection || false)
                },
                justifyContentOptions
            ];

        default:
            return [];
    }
}
