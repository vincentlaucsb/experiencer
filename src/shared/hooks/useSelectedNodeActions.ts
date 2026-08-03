import { SelectedNodeActions } from '@/controls/SelectedNodeActions';
import { useEditorStore, useSelectedNodeId } from '@/shared/stores/editorStore';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import useClipboardProps from '@/shared/hooks/useClipboardProps';
import useMoveSelectedProps from '@/shared/hooks/useMoveSelectedProps';

export default function useSelectedNodeActions(): SelectedNodeActions {
    const selectedNodeId = useSelectedNodeId();
    const clipboardProps = useClipboardProps();
    const moveSelectedProps = useMoveSelectedProps();

    const duplicateSelected = (before: boolean) => {
        if (!selectedNodeId) {
            return;
        }

        const duplicateUuid = resumeNodeStore.duplicateNode(selectedNodeId, before);
        if (duplicateUuid) {
            useEditorStore.getState().selectNode(duplicateUuid);
        }
    };

    return {
        ...clipboardProps,
        ...moveSelectedProps,
        duplicateBefore: () => duplicateSelected(true),
        duplicateAfter: () => duplicateSelected(false),
        delete: () => {
            if (!selectedNodeId) {
                return;
            }

            resumeNodeStore.deleteNode(selectedNodeId);
        }
    };
}
