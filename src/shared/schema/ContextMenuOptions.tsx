import { ResumeNode, NodeProperty } from "@/shared/utils/Types";
import RichText from "@/resume/RichText";

interface ContextMenuOption {
    text: string;
    action: () => void;
}

/**
 * Retrieves custom context menu options for a node
 * @param type
 * @param node
 * @param updateNode
 */
export default function contextMenuOptions(
    node: ResumeNode,
    updateNode: (key: string, value: NodeProperty) => void):
    ContextMenuOption[]
{
    switch (node.type) {
        default:
            return [];
    }
}