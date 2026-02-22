import { ResumeNode } from '@/types';
import copyToClipboard from './copyToClipboard';
import deleteSelectedNode from '@/shared/stores/resumeStore/deleteSelectedNode';

export default function cutToClipboard(node: ResumeNode | undefined) {
    if (!node) return;

    copyToClipboard(node);
    deleteSelectedNode(node.uuid);
}
