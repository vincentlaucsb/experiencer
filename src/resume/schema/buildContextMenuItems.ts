import type { MenuItem } from "popright";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import type { NodeProperty } from "@/types";
import type { ContextMenuItemData } from "@/types/contextMenu";

interface ContextMenuActions {
    editNode: (uuid: string) => void;
    selectNode: (uuid: string) => void;
}

export default function buildContextMenuItems(uuid: string, actions: ContextMenuActions): MenuItem[] {
    const node = resumeNodeStore.getNodeByUuid(uuid);
    if (!node) {
        return [];
    }

    const parentItems: MenuItem[] = resumeNodeStore.getParentUuids(uuid).flatMap((parentUuid) => {
        const parentNode = resumeNodeStore.getNodeByUuid(parentUuid);
        if (!parentNode) {
            return [];
        }

        return [{
            id: `select-${parentUuid}`,
            label: `Select ${getParentLabel(parentNode)}`,
            onSelect: () => actions.selectNode(parentUuid)
        }];
    });

    const additionalItems: MenuItem[] = [];
    if (ComponentTypes.instance.isEditable(node.type)) {
        additionalItems.push({
            id: `edit-${uuid}`,
            label: "Edit",
            onSelect: () => actions.editNode(uuid)
        });
    }

    const updateNode = (key: string, data: NodeProperty) => resumeNodeStore.updateNode(uuid, key, data);
    additionalItems.push(...mapContextMenuOptions(
        ComponentTypes.instance.contextMenuOptions(node, updateNode),
        `custom-${uuid}`
    ));

    return [
        { type: "header", label: getNodeLabel(node.type) },
        ...parentItems,
        ...(additionalItems.length > 0 ? [{ type: "separator" } as MenuItem] : []),
        ...additionalItems
    ];
}

function mapContextMenuOptions(options: ContextMenuItemData[], idPrefix: string): MenuItem[] {
    return options.map((option, index) => ({
        id: `${idPrefix}-${index}`,
        label: option.text,
        onSelect: option.onClick
    }));
}

function getParentLabel(node: { type: string; value?: unknown }): string {
    if (node.type === "Section" && typeof node.value === "string" && node.value.length > 0) {
        return `${getNodeLabel(node.type)}: ${node.value}`;
    }

    return getNodeLabel(node.type);
}

function getNodeLabel(type: string): string {
    try {
        return ComponentTypes.instance.defaultValue(type).text;
    } catch {
        return type;
    }
}
