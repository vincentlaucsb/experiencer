import { useEditorStore } from "../stores/editorStore";
import { recordHistory } from "../stores/historyStore";
import { useResumeStore } from "../stores/resumeStore";

/**
 * Hook with functions to move the selected node up or down in the resume tree.
 * @returns An object with `moveUp` and `moveDown` functions, or `undefined` if the actions are not possible.
 */
export default function useMoveSelectedProps() {
    const uuid = useEditorStore((state) => state.selectedNodeId);

    if (!uuid) {
        return { moveUp: undefined, moveDown: undefined };
    }

    const tree = useResumeStore.getState().tree;
    const id = tree.getHierarchicalId(uuid);
    if (!id) {
        return { moveUp: undefined, moveDown: undefined };
    }

    const moveSelectedDownEnabled = !tree.isLastSibling(id);
    const moveSelectedUpEnabled = id[id.length - 1] > 0;

    return {
        moveUp: moveSelectedUpEnabled ?
            () => {
                recordHistory();
                const newUuid = useResumeStore.getState().moveNodeUpByUuid(uuid);
                useEditorStore.getState().selectNode(newUuid);
            } :
            undefined,
        moveDown: moveSelectedDownEnabled ?
            () => {
                recordHistory();
                const newUuid = useResumeStore.getState().moveNodeDownByUuid(uuid);
                useEditorStore.getState().selectNode(newUuid);
            } :
            undefined
    };
}