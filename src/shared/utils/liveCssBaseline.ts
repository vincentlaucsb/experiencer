import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import {
    inspectLiveCssTree,
    LiveCssTreeChange
} from "@/shared/utils/liveCssSync";

export type LiveCssTreeName = "resume" | "root";

export interface ScopedLiveCssTreeChange extends LiveCssTreeChange {
    tree: LiveCssTreeName;
}

type DeclarationChangeType = "added" | "changed" | "removed";

function declarationChangeKey(
    change: ScopedLiveCssTreeChange,
    type: DeclarationChangeType,
    property: string
) {
    return JSON.stringify([
        change.tree,
        change.path,
        change.selector,
        type,
        property,
        change.previousDeclarations.get(property) ?? null,
        change.declarations.get(property) ?? null
    ]);
}

function declarationChangeKeys(change: ScopedLiveCssTreeChange) {
    return [
        ...change.added.map((property) => declarationChangeKey(change, "added", property)),
        ...change.changed.map((property) => declarationChangeKey(change, "changed", property)),
        ...change.removed.map((property) => declarationChangeKey(change, "removed", property))
    ];
}

export function inspectScopedLiveCssChanges(
    css: CssNode,
    rootCss: CssNode,
    ownerDocument: Document = document
): ReadonlyArray<ScopedLiveCssTreeChange> {
    const rootChanges = inspectLiveCssTree(
        new ReadonlyCssNode(rootCss),
        ownerDocument
    ).map((change): ScopedLiveCssTreeChange => ({ ...change, tree: "root" }));
    const resumeChanges = inspectLiveCssTree(
        new ReadonlyCssNode(css),
        ownerDocument
    ).map((change): ScopedLiveCssTreeChange => ({ ...change, tree: "resume" }));

    return [...rootChanges, ...resumeChanges];
}

export function createLiveCssBaseline(
    changes: ReadonlyArray<ScopedLiveCssTreeChange>
): ReadonlySet<string> {
    return new Set(changes.flatMap(declarationChangeKeys));
}

export function filterLiveCssChanges(
    changes: ReadonlyArray<ScopedLiveCssTreeChange>,
    baseline: ReadonlySet<string>
): ReadonlyArray<ScopedLiveCssTreeChange> {
    return changes.flatMap((change) => {
        const added = change.added.filter(
            (property) => !baseline.has(declarationChangeKey(change, "added", property))
        );
        const changed = change.changed.filter(
            (property) => !baseline.has(declarationChangeKey(change, "changed", property))
        );
        const removed = change.removed.filter(
            (property) => !baseline.has(declarationChangeKey(change, "removed", property))
        );

        if (added.length === 0 && changed.length === 0 && removed.length === 0) {
            return [];
        }

        // Import only genuine post-baseline edits. Starting from the authored
        // declarations prevents browser normalization noise on the same rule
        // from leaking into the CSS tree when a real edit is imported.
        const declarations = new Map(change.previousDeclarations);
        for (const property of [...added, ...changed]) {
            const value = change.declarations.get(property);
            if (value !== undefined) {
                declarations.set(property, value);
            }
        }
        for (const property of removed) {
            declarations.delete(property);
        }

        return [{
            ...change,
            status: "changed" as const,
            declarations,
            added,
            changed,
            removed
        }];
    });
}

/** Holds the browser-normalization baseline for the current authored stylesheet. */
class LiveCssBaselineStore {
    private baseline: ReadonlySet<string> = new Set();
    private ready = false;

    capture(changes: ReadonlyArray<ScopedLiveCssTreeChange>) {
        this.baseline = createLiveCssBaseline(changes);
        this.ready = true;
    }

    filter(changes: ReadonlyArray<ScopedLiveCssTreeChange>) {
        if (!this.ready) {
            return [];
        }
        return filterLiveCssChanges(changes, this.baseline);
    }

    reset() {
        this.baseline = new Set();
        this.ready = false;
    }
}

export const liveCssBaselineStore = new LiveCssBaselineStore();
