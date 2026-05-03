import { ResumeNode } from "@/types";
import { ContextMenuItemData } from "@/types/contextMenu";

interface LinkNodeData {
    url?: string;
}

const MAX_URL_LABEL_LENGTH = 36;

export default function getLinkContextMenuOptions(
    _updateNode: (key: string, value: any) => void,
    node: ResumeNode<LinkNodeData>
): ContextMenuItemData[] {
    const url = node.url?.trim();
    if (!url) {
        return [];
    }

    return [{
        text: `Go to ${truncateUrl(url)}`,
        onClick: () => openInNewTab(url)
    }];
}

function truncateUrl(url: string): string {
    if (url.length <= MAX_URL_LABEL_LENGTH) {
        return url;
    }

    return `${url.slice(0, MAX_URL_LABEL_LENGTH - 3)}...`;
}

function openInNewTab(url: string) {
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (opened) {
        opened.opener = null;
    }
}
