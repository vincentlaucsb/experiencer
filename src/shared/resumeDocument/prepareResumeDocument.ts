import CssNode from '@/shared/CssTree';
import { assignIds } from '@/shared/utils/assignIds';
import { deepCopy } from '@/shared/utils/deepCopy';
import getResumeMinHeight from '@/shared/utils/getResumeMinHeight';
import {
    scopeResumeStylesheetToEditor,
    validateAuthoredResumeStylesheet
} from '@/shared/utils/transformResumeStylesheet';
import type { ResumeFont, ResumeNode, ResumeSaveData } from '@/types';
import PageSize from '@/types/PageSize';
import { normalizeResumeCssSelectors } from './normalizeResumeCssSelectors';

export type ResumeRenderTarget =
    | 'editor'
    | 'isolated-preview'
    | 'standalone-preview'
    | 'print'
    | 'export'
    | 'png'
    | 'render-service'
    | 'public-review';

export type ResumeDocumentRoot =
    | 'editor-host'
    | 'document-body'
    | 'public-review-shell';

export interface ResumeDocumentSource {
    nodes: ResumeNode[];
    stylesheet: string;
    pageSize: PageSize;
    fonts?: ResumeFont[];
    ariaLabel: string;
}

export interface PreparedResumeDocument extends ResumeDocumentSource {
    target: ResumeRenderTarget;
    root: ResumeDocumentRoot;
    readOnly: boolean;
    width: string;
    minHeight: string;
}

/** Serialize the authored stylesheet stored in the two CSS trees. */
export function getAuthoredResumeStylesheet(data: ResumeSaveData): string {
    const normalizedData = normalizeResumeCssSelectors(data);
    return `${CssNode.load(normalizedData.rootCss).stylesheet()}\n\n${
        CssNode.load(normalizedData.builtinCss).stylesheet()
    }`;
}

/** Normalize immutable saved data before any browser rendering adapter receives it. */
export function createResumeDocumentSource(
    data: ResumeSaveData,
    ariaLabel: string,
    pageSize: PageSize = data.pageSize ?? PageSize.Letter
): ResumeDocumentSource {
    return {
        nodes: assignIds(deepCopy(data.childNodes) as ResumeSaveData['childNodes']),
        stylesheet: getAuthoredResumeStylesheet(data),
        pageSize,
        fonts: data.fonts ? deepCopy(data.fonts) : undefined,
        ariaLabel
    };
}

function rootForTarget(target: ResumeRenderTarget): ResumeDocumentRoot {
    if (target === 'editor') return 'editor-host';
    if (target === 'public-review') return 'public-review-shell';
    return 'document-body';
}

/**
 * Apply the rendering contract shared by editor, previews, output, and review snapshots.
 * Only the editor receives scoped CSS; authored and exported documents remain standalone.
 */
export function prepareResumeDocument(
    source: ResumeDocumentSource,
    target: ResumeRenderTarget
): PreparedResumeDocument {
    const stylesheet = target === 'editor'
        ? scopeResumeStylesheetToEditor(source.stylesheet)
        : validateAuthoredResumeStylesheet(source.stylesheet);

    return {
        ...source,
        target,
        root: rootForTarget(target),
        readOnly: target !== 'editor',
        stylesheet,
        width: source.pageSize === PageSize.A4 ? '210mm' : '8.5in',
        minHeight: getResumeMinHeight(source.nodes, source.pageSize)
    };
}
