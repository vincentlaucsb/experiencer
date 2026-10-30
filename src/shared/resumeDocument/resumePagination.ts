import PageSize from '@/types/PageSize';
import { getResumePrintGeometry, getResumeFragmentRules } from '@/shared/utils/resumePrintGeometry';

const installedGeometry = new WeakMap<HTMLElement, Readonly<Record<string, string>>>();

/** The measured snapshot is shared by PNG, native print, and print-pagination measurement. */
export function getInstalledResumeGeometry(body: HTMLElement): Readonly<Record<string, string>> | undefined {
    return installedGeometry.get(body);
}

export const RESUME_PAGINATION_ID = 'resume-document-pagination';

/** Native fragmentation for paged read-only surfaces; the editor deliberately remains continuous. */
export function installResumePagination(body: HTMLElement, pageSize: PageSize): () => void {
    const doc = body.ownerDocument;
    const previous = body.getAttribute('style');
    const style = doc.createElement('style');
    style.id = RESUME_PAGINATION_ID;
    // A portal-only application mount must never occupy a grid cell in the authored body.
    style.textContent = ':where(body) { margin: 0; } body > #root:not([data-uuid]) { display: none !important; }';
    doc.head.appendChild(style);
    const geometry = getResumePrintGeometry(body, pageSize);
    const height = pageSize === PageSize.A4 ? 297 * 96 / 25.4 : 1056;
    const width = pageSize === PageSize.A4 ? '210mm' : '8.5in';
    style.textContent = `
        :where(body) { margin: 0; } body > #root:not([data-uuid]) { display: none !important; }
        @page { size: ${pageSize === PageSize.A4 ? 'A4' : 'Letter'}; margin: 0; }
        ${getResumeFragmentRules(geometry)}
        @media screen {
            @supports (column-height: 1px) and (column-wrap: wrap) {
                html { width: ${width}; column-count: 1; column-height: ${height}px;
                    column-wrap: wrap; column-fill: auto; column-gap: 0; row-gap: 0; padding: 0; margin: 0 auto; }
                .page-break { break-after: column !important; height: 0 !important; min-height: 0 !important; }
            }
        }
        @media print {
            html { column-count: auto; column-height: auto; column-wrap: nowrap; }
            body { min-height: ${geometry['min-height']} !important; }
        }
    `;
    for (const [key, value] of Object.entries(geometry)) body.style.setProperty(key, value, 'important');
    // A screen page is a complete paper canvas, including sparse final pages.
    const minimum = Math.max(height, Number.parseFloat(geometry['min-height']));
    body.style.minHeight = minimum === height ? (pageSize === PageSize.A4 ? '297mm' : '11in') : `${minimum}px`;
    doc.head.appendChild(style);
    installedGeometry.set(body, geometry);
    return () => {
        installedGeometry.delete(body);
        style.remove();
        if (previous === null) body.removeAttribute('style'); else body.setAttribute('style', previous);
    };
}

/** True only when the screen adapter is actually fragmenting, never for the continuous editor. */
export function hasResumePagination(body: HTMLElement): boolean {
    return body.ownerDocument.getElementById(RESUME_PAGINATION_ID) !== null
        && body.ownerDocument.defaultView?.CSS?.supports('column-wrap', 'wrap') === true;
}

/** Cloned padding counts once per fragment, not again as continuous minimum content. */
export function setResumePageCount(body: HTMLElement, pageCount: number, pageHeight: number): void {
    const style = body.ownerDocument.defaultView!.getComputedStyle(body);
    const insets = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    body.style.minHeight = `${pageCount * pageHeight - (pageCount - 1) * insets}px`;
}
