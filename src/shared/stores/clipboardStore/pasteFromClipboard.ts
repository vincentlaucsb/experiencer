import { stripNodeProperties } from '@/shared/utils/stripNodeProperties';
import type { ResumeNode } from '@/types';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useClipboardStore } from './store';

export default function pasteFromClipboard(targetUuid: string | undefined) {
    const clipboard = useClipboardStore.getState().clipboard;
    if (!clipboard) return;

    // Every paste creates a new subtree, so authored HTML IDs cannot be reused.
    // Only htmlId is stripped; runtime UUIDs remain until addNode regenerates them.
    const copiedNode = stripNodeProperties([clipboard], ['htmlId'])[0] as ResumeNode;
    if (!resumeNodeStore.canAddNode(targetUuid, copiedNode)) {
        resumeNodeStore.addNode(targetUuid, copiedNode);
        return;
    }

    resumeNodeStore.addNode(targetUuid, copiedNode);
}
