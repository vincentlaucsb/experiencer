import { useEditorStore } from "../stores/editorStore";
import { recordHistory } from "../stores/historyStore";
import { resumeNodeStore } from "../stores/resumeNodeStore";

/**
 * Hook with functions to move the selected node up or down in the resume tree.
 * @returns An object with `moveUp` and `moveDown` functions, or `undefined` if the actions are not possible.
 */
export default function useMoveSelectedProps() {
    const uuid = useEditorStore((state) => state.selectedNodeId);

    if (!uuid) {
        return { moveUp: undefined, moveDown: undefined };
    }

    const tree = resumeNodeStore.data;
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
                const newUuid = resumeNodeStore.moveNodeUp(uuid) as string;
                useEditorStore.getState().selectNode(newUuid);
            } :
            undefined,
        moveDown: moveSelectedDownEnabled ?
            () => {
                recordHistory();
                const newUuid = resumeNodeStore.moveNodeDown(uuid) as string;
                useEditorStore.getState().selectNode(newUuid);
            } :
            undefined
    };
}