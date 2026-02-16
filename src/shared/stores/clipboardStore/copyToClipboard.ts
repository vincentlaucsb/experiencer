import { deepCopy } from '@/shared/utils/Helpers';
import { ResumeNode } from '@/types';
import { useClipboardStore } from './store';

export default function copyToClipboard(node: ResumeNode | undefined) {
    if (!node) return;

    useClipboardStore.getState().setClipboard(deepCopy(node));
}
