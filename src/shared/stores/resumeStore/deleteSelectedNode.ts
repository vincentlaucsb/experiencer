import { resumeNodeStore } from "../resumeNodeStore";
import { useEditorStore } from "../editorStore";
import { recordHistory } from "../historyStore";

export default function deleteSelectedNode(uuid?: string) {
    if (!uuid) return;

    recordHistory();
    resumeNodeStore.deleteNode(uuid);
    useEditorStore.getState().unselectNode();
}