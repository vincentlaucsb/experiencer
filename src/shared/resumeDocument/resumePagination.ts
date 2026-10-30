import PageSize from '@/types/PageSize';
import { getResumePrintGeometry, getResumeFragmentRules } from '@/shared/utils/resumePrintGeometry';

interface InstalledPagination {
    geometry: Readonly<Record<string, string>>;
    pageHeight: number;
}
const installedPagination = new WeakMap<HTMLElement, InstalledPagination>();

/** Share the measured geometry snapshot between PNG, native print, and print measurement. */
export function getInstalledResumeGeometry(body: HTMLElement): Readonly<Record<string, string>> | undefined {
    return installedPagination.get(body)?.geometry;
}

export const RESUME_PAGINATION_ID = 'resume-document-pagination';

/** Native physical pages for read-only surfaces; the editor deliberately remains continuous. */
export function installResumePagination(body: HTMLElement, pageSize: PageSize): () => void {
    const doc = body.ownerDocument;
    const previous = body.getAttribute('style');
    const style = doc.createElement('style');
    style.id = RESUME_PAGINATION_ID;
    // Authored nodes carry data-uuid; only the portal-only application mount is excluded.
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
                html:root { display: block !important; width: ${width} !important; min-width: 0 !important;
                    max-width: none !important; column-count: 1 !important; column-height: ${height}px !important;
                    column-wrap: wrap !important; column-fill: auto !important; column-gap: 0 !important;
                    row-gap: 0 !important; padding: 0 !important; margin: 0 auto !important; }
                .page-break { break-after: column !important; height: 0 !important; min-height: 0 !important; }
            }
        }
        @media print {
            html:root { display: block !important; width: auto !important; min-width: 0 !important; max-width: none !important;
                margin: 0 !important; padding: 0 !important; column-count: auto !important; column-height: auto !important; column-wrap: nowrap !important; }
            body { min-height: ${geometry['min-height']} !important; }
        }
    `;
    for (const [key, value] of Object.entries(geometry)) body.style.setProperty(key, value, 'important');
    const minimum = Math.max(height, Number.parseFloat(geometry['min-height']));
    body.style.minHeight = minimum === height ? (pageSize === PageSize.A4 ? '297mm' : '11in') : `${minimum}px`;
    installedPagination.set(body, {geometry, pageHeight: height});
    return () => {
        installedPagination.delete(body);
        style.remove();
        if (previous === null) body.removeAttribute('style'); else body.setAttribute('style', previous);
    };
}

/** Do not skip legacy fillers merely because an engine recognizes the column properties. */
export function hasResumePagination(body: HTMLElement): boolean {
    const doc = body.ownerDocument, view = doc.defaultView;
    const installed = installedPagination.get(body);
    if (!installed || !doc.getElementById(RESUME_PAGINATION_ID)) return false;
    if (!view?.CSS?.supports('column-wrap', 'wrap')) return false;
    const style = view.getComputedStyle(doc.documentElement);
    if (style.display !== 'block' || style.columnCount !== '1') return false;
    if (style.getPropertyValue('column-wrap') !== 'wrap') return false;
    const height = Number.parseFloat(style.getPropertyValue('column-height'));
    return Number.isFinite(height) && Math.abs(height - installed.pageHeight) < 1;
}

/** Cloned body padding counts once per fragment, not again as continuous minimum content. */
export function setResumePageCount(body: HTMLElement, pageCount: number, pageHeight: number): void {
    const style = body.ownerDocument.defaultView!.getComputedStyle(body);
    const insets = Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom);
    body.style.minHeight = `${pageCount * pageHeight - (pageCount - 1) * insets}px`;
}
