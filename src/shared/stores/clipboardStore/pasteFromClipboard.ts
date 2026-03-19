import { deepCopy } from '@/shared/utils/deepCopy';
import { recordHistory } from '@/shared/stores/historyStore';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useClipboardStore } from './store';

export default function pasteFromClipboard(targetUuid: string | undefined) {
    if (!targetUuid) return;

    const clipboard = useClipboardStore.getState().clipboard;
    if (!clipboard) return;

    recordHistory();
    resumeNodeStore.addNode(targetUuid, deepCopy(clipboard));
}
