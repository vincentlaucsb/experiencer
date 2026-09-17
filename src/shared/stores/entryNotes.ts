import type { ResumeNode } from '@/types';
import { resumeNodeStore } from './resumeNodeStore';

export type EntryNote = { uuid: string; title: string; markdown: string; hidden: boolean };

/** Projects private entry metadata in the same depth-first order as the resume tree. */
export function getEntryNotes(): EntryNote[] {
    const result: EntryNote[] = [];
    const visit = (nodes: ResumeNode[], hidden = false) => nodes.forEach(node => {
        const isHidden = hidden || !!node.hidden || /(?:^|\s)hidden(?:\s|$)/.test(node.classNames ?? '');
        if (node.type === 'Entry') result.push({ uuid: node.uuid,
            title: [...(node.title ?? []), ...(node.subtitle ?? [])].filter(Boolean).join(' · ') || 'Untitled entry',
            markdown: typeof node.notes === 'string' ? node.notes : '', hidden: isHidden });
        visit(node.childNodes ?? [], isHidden);
    });
    visit(resumeNodeStore.data.childNodes);
    return result;
}

export function containingEntry(node: ResumeNode) {
    return [node.uuid, ...resumeNodeStore.getParentUuids(node.uuid)]
        .map(uuid => resumeNodeStore.getNodeByUuid(uuid)).find(candidate => candidate?.type === 'Entry');
}
