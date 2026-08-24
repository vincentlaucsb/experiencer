import { useState, type ReactNode } from "react";

import { Button } from "@/controls/Buttons";
import type { ReadonlyCssNode } from "@/shared/CssTree";

const VISIBLE_ANCESTOR_LIMIT = 3;

interface CssAncestorRulesProps {
    additionalAncestors?: ReadonlyArray<ReadonlyCssNode>;
    cssNode: ReadonlyCssNode;
    renderAncestor(ancestor: ReadonlyCssNode): ReactNode;
    visible: boolean;
}

export function collectCssAncestors(
    cssNode: ReadonlyCssNode,
    additionalAncestors: ReadonlyArray<ReadonlyCssNode> = []
) {
    const ancestors = [...cssNode.ancestors];
    const seenPaths = new Set(ancestors.map((ancestor) => ancestor.fullPath.join("\u0000")));

    for (const ancestor of additionalAncestors) {
        const pathKey = ancestor.fullPath.join("\u0000");
        if (!seenPaths.has(pathKey)) {
            ancestors.push(ancestor);
            seenPaths.add(pathKey);
        }
    }

    return ancestors;
}

/** Orders, deduplicates, and progressively reveals parent rules for one editor. */
export default function CssAncestorRules({
    additionalAncestors,
    cssNode,
    renderAncestor,
    visible
}: CssAncestorRulesProps) {
    const [showAll, setShowAll] = useState(false);
    if (!visible) return <></>;

    const ancestors = collectCssAncestors(cssNode, additionalAncestors);
    if (ancestors.length === 0) return <></>;

    const visibleAncestors = showAll
        ? ancestors
        : ancestors.slice(0, VISIBLE_ANCESTOR_LIMIT);
    const hiddenAncestorCount = ancestors.length - visibleAncestors.length;

    return (
        <div className="css-ancestor-context" aria-label="Parent CSS rules">
            {visibleAncestors.map(renderAncestor)}
            {hiddenAncestorCount > 0 ? (
                <Button
                    className="css-show-more-parents"
                    onClick={() => setShowAll(true)}
                >
                    Show {hiddenAncestorCount} more parent{hiddenAncestorCount === 1 ? "" : "s"}
                </Button>
            ) : <></>}
        </div>
    );
}
