import { deepCopy } from '@/shared/utils/deepCopy';
import { recordHistory } from '@/shared/stores/historyStore';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useClipboardStore } from './store';

export default function pasteFromClipboard(targetUuid: string | undefined) {
    if (!targetUuid) return;

    const clipboard = useClipboardStore.getState().clipboard;
    if (!clipboard) return;

    const copiedNode = deepCopy(clipboard);
    if (!resumeNodeStore.canAddNode(targetUuid, copiedNode)) {
        resumeNodeStore.addNode(targetUuid, copiedNode);
        return;
    }

    recordHistory();
    resumeNodeStore.addNode(targetUuid, copiedNode);
}
