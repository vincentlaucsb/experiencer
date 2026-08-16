import ensureCssNodeForType from '@/shared/stores/ensureCssNodeForType';
import { runHistoryTransaction } from '@/shared/stores/historyStore';
import { AddChild, ResumeNode } from '@/types';

/** Inserts a node and seeds its CSS support as one undoable editor action. */
export default function addNodeAndEnsureCss(
    addChild: AddChild,
    parentUuid: string | undefined,
    node: ResumeNode
): void {
    runHistoryTransaction(() => {
        addChild(parentUuid, node);
        ensureCssNodeForType(node.type);
    });
}
