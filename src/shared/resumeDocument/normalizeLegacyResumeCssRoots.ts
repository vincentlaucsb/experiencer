import type { CssNodeDump, ResumeSaveData } from '@/types';

function replaceLegacyRootSelector(
    tree: CssNodeDump,
    canonicalSelector: ':root' | 'body'
): CssNodeDump {
    if (tree.selector.trim() !== '#resume') return tree;

    return {
        ...tree,
        selector: canonicalSelector
    };
}

/**
 * Migrate the former editor-host marker stored at CSS-tree roots.
 * Only the two framework-owned root selectors are rewritten; a nested
 * `#resume` remains authored CSS and is rejected by the rendering contract.
 */
export function normalizeLegacyResumeCssRoots(data: ResumeSaveData): ResumeSaveData {
    const builtinCss = replaceLegacyRootSelector(data.builtinCss, 'body');
    const rootCss = replaceLegacyRootSelector(data.rootCss, ':root');

    if (builtinCss === data.builtinCss && rootCss === data.rootCss) return data;

    return {
        ...data,
        builtinCss,
        rootCss
    };
}
