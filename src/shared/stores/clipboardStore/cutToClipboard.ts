import { ResumeNode } from '@/types';
import copyToClipboard from './copyToClipboard';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';

export default function cutToClipboard(node: ResumeNode | undefined) {
    if (!node) return;

    copyToClipboard(node);
    resumeNodeStore.deleteNode(node.uuid);
}
