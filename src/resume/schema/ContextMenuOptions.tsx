import { ResumeNode, NodeProperty } from "@/types";

interface ContextMenuOption {
    text: string;
    onClick: () => void;
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