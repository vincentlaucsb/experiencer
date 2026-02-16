import { useResumeStore } from "./index";
import { useEditorStore } from "../editorStore";
import { recordHistory } from "../historyStore";

export default function deleteSelectedNode(uuid?: string) {
    if (!uuid) return;

    recordHistory();
    useResumeStore.getState().deleteNodeByUuid(uuid);
    useEditorStore.getState().unselectNode();
}