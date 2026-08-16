import { cssStore, rootCssStore } from '@/shared/stores/cssStoreHooks';
import { runHistoryTransaction } from '@/shared/stores/historyStore';
import { ScopedLiveCssTreeChange } from '@/shared/utils/liveCssBaseline';

/** Applies one reviewed live-CSS import as a single undoable editor action. */
export default function applyScopedLiveCssChanges(
    changes: ReadonlyArray<ScopedLiveCssTreeChange>
): void {
    const rootChanges = changes.filter((change) => change.tree === 'root');
    const resumeChanges = changes.filter((change) => change.tree === 'resume');

    runHistoryTransaction(() => {
        if (rootChanges.length > 0) {
            rootCssStore.updateCss((root) => {
                for (const change of rootChanges) {
                    root.mustFindNode(Array.from(change.path))
                        .setProperties(new Map(change.declarations));
                }
            });
        }

        if (resumeChanges.length > 0) {
            cssStore.updateCss((root) => {
                for (const change of resumeChanges) {
                    root.mustFindNode(Array.from(change.path))
                        .setProperties(new Map(change.declarations));
                }
            });
        }
    });
}
