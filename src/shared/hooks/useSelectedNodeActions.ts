import { SelectedNodeActions } from '@/controls/SelectedNodeActions';
import { useSelectedNodeId } from '@/shared/stores/editorStore';
import deleteSelectedNode from '@/shared/stores/resumeStore/deleteSelectedNode';
import useClipboardProps from '@/shared/hooks/useClipboardProps';
import useMoveSelectedProps from '@/shared/hooks/useMoveSelectedProps';

export default function useSelectedNodeActions(): SelectedNodeActions {
    const selectedNodeId = useSelectedNodeId();
    const clipboardProps = useClipboardProps();
    const moveSelectedProps = useMoveSelectedProps();

    return {
        ...clipboardProps,
        ...moveSelectedProps,
        delete: () => deleteSelectedNode(selectedNodeId)
    };
}
