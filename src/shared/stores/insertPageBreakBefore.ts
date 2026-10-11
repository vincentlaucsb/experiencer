import { resumeNodeStore } from './resumeNodeStore';
import { runHistoryTransaction } from './historyStore';
import ensureCssNodeForType from './ensureCssNodeForType';
import type { ResumeNode } from '@/types';

const pageBreak: ResumeNode = { type: 'PageBreak', uuid: '' };

/** A break belongs to the selected node's flow, never inside its section content. */
export function canInsertPageBreakBefore(uuid: string): boolean {
    if (resumeNodeStore.getNodeByUuid(uuid)?.type !== 'Section') return false;
    return resumeNodeStore.canInsertSibling(uuid, pageBreak);
}

/** Keeps the node and its required print CSS together in one undoable operation. */
export function insertPageBreakBefore(uuid: string): void {
    if (!canInsertPageBreakBefore(uuid)) return;
    runHistoryTransaction(() => {
        resumeNodeStore.insertSibling(uuid, pageBreak, true);
        ensureCssNodeForType(pageBreak.type);
    });
}
