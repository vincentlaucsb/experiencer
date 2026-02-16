import { ResumeNode } from "@/types";
import { recordHistory } from "../historyStore";
import { useResumeStore } from "./store";

/**
 * Add node as a child to the node identified by UUID
 * @param parentUuid UUID of parent node, or undefined for root
 * @param node Node to be added
 */
export default function addChildNode(parentUuid: string | undefined, node: ResumeNode) {
    const { addNodeByUuid, addNode } = useResumeStore.getState();

    recordHistory();
    if (parentUuid) {
        addNodeByUuid(parentUuid, node);
    } else {
        // Add to root
        addNode([], node);
    }
}