import { NodeProperty } from "@/types";
import { recordHistory } from "../historyStore";
import { useResumeStore } from "./store";

export default function updateSelected(
    uuid: string | undefined, key: string, data: NodeProperty
) {
    if (!uuid) return;

    recordHistory();
    useResumeStore.getState().updateNodeByUuid(uuid, key, data);
}