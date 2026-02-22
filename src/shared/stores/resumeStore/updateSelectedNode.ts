import { NodeProperty } from "@/types";
import { recordHistory } from "../historyStore";
import { resumeNodeStore } from "../resumeNodeStore";

export default function updateSelected(
    uuid: string | undefined, key: string, data: NodeProperty
) {
    if (!uuid) return;

    recordHistory();
    resumeNodeStore.updateNodeByUuid(uuid, key, data);
}