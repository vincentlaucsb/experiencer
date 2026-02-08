import { NodeProperty, ResumeNode } from "@/types";
import { ToolbarItemData } from "@/types/toolbar";
import UrlInput from "@/controls/inputs/UrlInput";

export default function getLinkToolbarOptions(
    updateNode: (key: string, value: NodeProperty) => void,
    node: ResumeNode
): ToolbarItemData[] {
    return [
        {
            content: <UrlInput
                url={(node as any).url}
                onChange={(url) => updateNode('url', url)}
            />
        }
    ];
}
