import { assignIds } from "@/shared/utils/assignIds";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import Entry from "@/resume/Entry";
import Section from "@/resume/Section";
import type { AddChild, ResumeNode } from "@/types";
import type { ToolbarItemData } from "../toolbar/ToolbarButton";

interface AddOptionProps {
    options: string | Array<string>;
    addChild: AddChild;
    id: string | undefined;
    parentNode: ResumeNode;
}

/** Builds the contextual Insert action for the selected node. */
export function addOptions(data: AddOptionProps): ToolbarItemData {
    const options = data.options;
    const nodeInfo = (type: string) => ComponentTypes.instance.defaultValue(type);

    if (Array.isArray(options)) {
        if (options.length === 0) {
            return {};
        }

        const optionTypes = prioritizeSectionEntry(options, data.parentNode);

        return {
            text: "Insert",
            icon: "ui-add",
            items: optionTypes.map((nodeType: string) => {
                const info = nodeInfo(nodeType);

                return {
                    icon: info.icon,
                    iconTone: isPrioritizedSectionEntry(nodeType, data.parentNode) ? "brand" : undefined,
                    text: getInsertOptionText(nodeType, info.text, data.parentNode),
                    onClick: () => data.addChild(data.id, assignIds(info.node))
                } as ToolbarItemData;
            })
        };
    }

    const node = nodeInfo(options);
    return {
        onClick: () => data.addChild(data.id, assignIds(node.node)),
        text: `Add ${node.text}`
    };
}

export function hasChildInsertOptions(options: string | Array<string>): boolean {
    return Array.isArray(options) ? options.length > 0 : !!options;
}

function getInsertOptionText(nodeType: string, defaultText: string, parentNode: ResumeNode): string {
    const sectionName = parentNode.type === Section.type ? parentNode.value?.trim() : undefined;

    if (nodeType === Entry.type && parentNode.type === Section.type) {
        return sectionName ? `${sectionName} Entry` : defaultText;
    }

    return defaultText;
}

function prioritizeSectionEntry(options: Array<string>, parentNode: ResumeNode): Array<string> {
    if (parentNode.type !== Section.type) {
        return options;
    }

    const entryIndex = options.indexOf(Entry.type);
    if (entryIndex <= 0) {
        return options;
    }

    return [Entry.type, ...options.filter((_option, index) => index !== entryIndex)];
}

function isPrioritizedSectionEntry(nodeType: string, parentNode: ResumeNode): boolean {
    return nodeType === Entry.type
        && parentNode.type === Section.type
        && Boolean(parentNode.value?.trim());
}
