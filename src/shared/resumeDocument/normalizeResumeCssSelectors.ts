import type { CssNodeDump, ResumeSaveData } from '@/types';
import { removeReservedEditorHost } from '@/shared/utils/transformResumeStylesheet';

function normalizeTree(
    tree: CssNodeDump,
    canonicalRoot: ':root' | 'body',
    isRoot = true
): CssNodeDump {
    const selector = isRoot && tree.selector.trim() === '#resume'
        ? canonicalRoot
        : removeReservedEditorHost(tree.selector);
    const children = tree.children.map((child) => normalizeTree(child, canonicalRoot, false));
    const childrenChanged = children.some((child, index) => child !== tree.children[index]);

    if (selector === tree.selector && !childrenChanged) return tree;
    return { ...tree, selector, children };
}

/**
 * Remove the private editor host from every selector loaded from saved data.
 * This is a compatibility migration only; newly authored selectors are rejected
 * before mutation so `#resume` cannot re-enter persisted résumé CSS.
 */
export function normalizeResumeCssSelectors(data: ResumeSaveData): ResumeSaveData {
    const builtinCss = normalizeTree(data.builtinCss, 'body');
    const rootCss = normalizeTree(data.rootCss, ':root');

    if (builtinCss === data.builtinCss && rootCss === data.rootCss) return data;
    return { ...data, builtinCss, rootCss };
}
