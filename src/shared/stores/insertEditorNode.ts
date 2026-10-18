import type { AddChild, ResumeNode } from '@/types';
import ComponentTypes from '@/resume/schema/ComponentTypes';
import { useEditorStore } from './editorStore';
import { runHistoryTransaction } from './historyStore';
import ensureCssNodeForType from './ensureCssNodeForType';
import { revealResumeNode } from '@/shared/utils/revealResumeNode';

/** Inserts, selects and reveals the actual fresh identity assigned by the document store. */
export function insertEditorNode(addChild: AddChild, parentUuid: string | undefined, node: ResumeNode): void {
    const uuid = runHistoryTransaction(() => {
        const inserted = addChild(parentUuid, node);
        if (inserted && node.type === 'PageBreak') ensureCssNodeForType(node.type);
        return inserted;
    });
    if (!uuid) return;
    if (node.type === 'Section' || ComponentTypes.instance.isEditable(node.type)) useEditorStore.getState().editNode(uuid);
    else useEditorStore.getState().selectNode(uuid);
    revealResumeNode(uuid);
}
