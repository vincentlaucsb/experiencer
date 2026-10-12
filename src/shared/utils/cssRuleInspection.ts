import CssNode from '@/shared/CssTree';
import type { LiveCssTreeName } from '@/shared/stores/LiveCssSyncCoordinator';

export interface CssRuleTarget {
    tree: LiveCssTreeName;
    path: ReadonlyArray<string>;
    /** Tree identity prevents a focus request from following a replacement document. */
    owner: CssNode;
}

/** Project a raw-rule target into its editable top-level subtree. */
export function resolveCssRuleTarget(target: CssRuleTarget | undefined, css: CssNode, rootCss: CssNode) {
    if (!target) return;
    const owner = target.tree === 'root' ? rootCss : css;
    if (target.owner !== owner || !owner.findNode([...target.path])) return;
    return {
        tree: target.tree,
        node: owner.mustFindNode(target.path.length ? [target.path[0]] : []),
        expandedPath: target.path
    };
}

/** Use the canonical serializer's owner paths instead of matching selector text. */
export function getInspectableCssRules(css: CssNode, rootCss: CssNode) {
    return ([['root', rootCss], ['resume', css]] as const).flatMap(([tree, owner]) =>
        owner.stylesheetRules().map(rule => ({
            ...rule,
            target: { tree, owner, path: rule.path } as CssRuleTarget
        }))
    );
}

/** Place keyboard focus and scrolling at the requested rule after its expansion mounts. */
export function focusInspectedCssRule(element: HTMLElement | null, pathKey: string, expandedPath?: ReadonlyArray<string>) {
    if (!element || !expandedPath || pathKey !== JSON.stringify(expandedPath)) return;
    element.focus({ preventScroll: true });
    element.scrollIntoView({ block: 'nearest' });
}
