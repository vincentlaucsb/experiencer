import { waitForResumeDocumentAssets } from './resumeDocumentReadiness';
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

/** One physical column per row is shared by supported read-only rendering and print. */
export function getResumePaginationRules(pageSize: PageSize): string {
    const height = pageSize === PageSize.A4 ? 297 * 96 / 25.4 : 1056;
    const width = pageSize === PageSize.A4 ? '210mm' : '8.5in';
    return `@supports (column-height: 1px) and (column-wrap: wrap) {
        html:root { display: block !important; width: ${width} !important; min-width: 0 !important;
            max-width: none !important; height: auto !important; min-height: 0 !important; max-height: none !important; column-count: 1 !important; column-height: ${height}px !important;
            column-wrap: wrap !important; column-fill: auto !important; column-gap: 0 !important;
            row-gap: 0 !important; padding: 0 !important; margin: 0 auto !important; }
        .page-break { break-after: column !important; height: 0 !important; min-height: 0 !important; }
        @media print { html:root { margin: 0 !important; } }
    }`;
}

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
    style.textContent = `
        :where(body) { margin: 0; } body > #root:not([data-uuid]) { display: none !important; }
        @page { size: ${pageSize === PageSize.A4 ? 'A4' : 'Letter'}; margin: 0; }
        ${getResumeFragmentRules(geometry)}
        ${getResumePaginationRules(pageSize)}
        @media print {
            html:root { display: block !important; width: auto !important; min-width: 0 !important; max-width: none !important;
                height: auto !important; min-height: 0 !important; max-height: none !important;
                margin: 0 !important; padding: 0 !important; column-count: auto !important; column-height: auto !important; column-wrap: nowrap !important; }
            .page-break { break-after: page !important; }
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

const pendingPagination = new WeakMap<HTMLElement, Promise<void>>();

/** Geometry is measured after assets settle; disposed previews cannot install stale geometry. */
export function scheduleResumePagination(body: HTMLElement, pageSize: PageSize): () => void {
    let active = true;
    let remove: () => void = () => undefined;
    const ready = waitForResumeDocumentAssets(body.ownerDocument).then(() => {
        if (active) remove = installResumePagination(body, pageSize);
    });
    pendingPagination.set(body, ready);
    // A view may have no measurement consumer. Consumers still receive the original error.
    void ready.catch(() => undefined);
    return () => {
        active = false;
        remove();
        if (pendingPagination.get(body) === ready) pendingPagination.delete(body);
    };
}

export async function waitForResumePagination(body: HTMLElement): Promise<void> {
    await pendingPagination.get(body);
}


/** The physical page canvas is HTML; a fragmented BODY's union box is not paper geometry. */
export function getResumePhysicalCanvas(body: HTMLElement): {x: number; y: number; width: number; height: number; pageHeight: number; pageCount: number} | undefined {
    if (!hasResumePagination(body)) return undefined;
    const root = body.ownerDocument.documentElement;
    const bounds = root.getBoundingClientRect();
    const pageHeight = installedPagination.get(body)!.pageHeight;
    // Native wrapped layout consists of whole paper rows. Integer scroll/PNG heights
    // can round A4 up or down, so count the unrounded layout rather than raster pixels.
    const wrappedPages = Math.max(1, Math.round(bounds.height / pageHeight));
    // An unfragmentable authored box/decoration can overflow the wrapped rows. It
    // still occupies additional PDF paper; ignore only integer raster rounding.
    let overflowHeight = root.scrollHeight;
    if (overflowHeight > Math.ceil(bounds.height) && overflowHeight <= body.ownerDocument.defaultView!.innerHeight) {
        // Root scrollHeight is floored by the viewport. Read actual rendered boxes
        // only in that ambiguous case; resizing a frame must not invent paper.
        const range = body.ownerDocument.createRange();
        range.selectNodeContents(root);
        let bottom = bounds.bottom;
        for (const rect of range.getClientRects()) bottom = Math.max(bottom, rect.bottom);
        range.detach();
        overflowHeight = Math.ceil(bottom - bounds.top);
    }
    const overflowPages = overflowHeight > Math.ceil(bounds.height)
        ? Math.ceil(overflowHeight / pageHeight) : wrappedPages;
    const pageCount = Math.max(wrappedPages, overflowPages);
    return {x: bounds.x, y: bounds.y, width: bounds.width,
        height: Math.ceil(Math.max(bounds.height, pageCount * pageHeight)), pageHeight, pageCount};
}
