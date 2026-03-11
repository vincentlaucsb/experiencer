import { deepCopy } from '@/shared/utils/deepCopy';
import addChildNode from '@/shared/stores/resumeStore/addChildNode';
import { useClipboardStore } from './store';

export default function pasteFromClipboard(targetUuid: string | undefined) {
    if (!targetUuid) return;

    const clipboard = useClipboardStore.getState().clipboard;
    if (!clipboard) return;

    addChildNode(targetUuid, deepCopy(clipboard));
}
