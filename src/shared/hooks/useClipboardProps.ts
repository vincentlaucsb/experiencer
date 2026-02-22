import { useSelectedNodeId } from '@/shared/stores/editorStore';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { copyToClipboard, cutToClipboard, pasteFromClipboard, useClipboard } from '@/shared/stores/clipboardStore';

export default function useClipboardProps() {
    const selectedNodeId = useSelectedNodeId();
    const clipboard = useClipboard();

    return {
        copyClipboard: () => {
            const selectedNode = selectedNodeId
                ? resumeNodeStore.getNodeByUuid(selectedNodeId)
                : undefined;
            copyToClipboard(selectedNode);
        },
        cutClipboard: () => {
            const selectedNode = selectedNodeId
                ? resumeNodeStore.getNodeByUuid(selectedNodeId)
                : undefined;
            cutToClipboard(selectedNode);
        },
        pasteClipboard: clipboard && selectedNodeId
            ? () => pasteFromClipboard(selectedNodeId)
            : undefined
    };
}
