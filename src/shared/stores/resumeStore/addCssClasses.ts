import { ResumeNode } from "@/types";
import { resumeNodeStore } from "../resumeNodeStore";
import { getCssClassesError } from '@/shared/utils/validateNodeCssNames';
import { showToast } from '../toastStore';

/**
 * Add CSS classes to a given node.
 * @param node The ResumeNode to which CSS classes will be added.
 * @param classes A string of CSS classes to add (space-separated).
 */
export default function addCssClasses(
    node: ResumeNode | undefined,
    classes: string
) {
    const error = getCssClassesError(classes);
    if (error) { showToast(error); return; }
    const uuid = node?.uuid;
    if (!uuid) return; // If there's no UUID, we can't proceed
    
    resumeNodeStore.updateNode(uuid, 'classNames', classes);
}
