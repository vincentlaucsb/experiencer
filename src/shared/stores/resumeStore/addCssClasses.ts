import { ResumeNode } from "@/types";
import { recordHistory } from "../historyStore";
import { resumeNodeStore } from "../resumeNodeStore";

/**
 * Add CSS classes to a given node.
 * @param node The ResumeNode to which CSS classes will be added.
 * @param classes A string of CSS classes to add (space-separated).
 */
export default function addCssClasses(
    node: ResumeNode | undefined,
    classes: string
) {
    const uuid = node?.uuid;
    if (!uuid) return; // If there's no UUID, we can't proceed
    
    recordHistory();
    resumeNodeStore.updateNodeByUuid(uuid, 'classNames', classes);
}