import { waitForResumeDocumentAssets } from '@/shared/resumeDocument/resumeDocumentReadiness';
import { getResumePaginationRules } from '@/shared/resumeDocument/resumePagination';
import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import {
    prepareResumeDocument,
    type ResumeDocumentSource,
    type ResumeRenderTarget
} from '@/shared/resumeDocument/prepareResumeDocument';
import { renderResumeMarkup } from '@/shared/resumeDocument/renderResumeMarkup';
import { buildHtmlExportPackage } from '@/shared/utils/HtmlExportPackage';
import PageSize from '@/types/PageSize';
import { mountResumeDocument } from '@/shared/resumeDocument/mountResumeDocument';
import { getResumePrintGeometry, getResumeFragmentRules } from '@/shared/utils/resumePrintGeometry';

/** Opens a resume-only tab and invokes the browser print dialog after its assets settle. */
export async function printResume(
    source: ResumeDocumentSource
): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('The print preview was blocked. Allow pop-ups and try again.');
    }
    showPrintLoadingState(printWindow);

    let capture: Awaited<ReturnType<typeof capturePrintableResume>>;
    try {
        capture = await capturePrintableResume(source, 'print');
    } catch (error) {
        printWindow.close();
        throw error;
    }
    if (printWindow.closed) return;

    printWindow.document.open();
    printWindow.document.write(capture.html);
    printWindow.document.close();
    await waitForPrintableDocument(printWindow);
    if (printWindow.closed) return;

    printWindow.focus();
    printWindow.print();
}

/** Exports a resume-only HTML document and its font dependencies as a ZIP package. */
export async function exportResumeAsHtml(
    source: ResumeDocumentSource,
    filename: string = 'resume.zip'
): Promise<void> {
    const capture = await capturePrintableResume(source, 'export');
    const archive = await buildHtmlExportPackage({
        stylesheet: capture.stylesheet,
        resumeHtml: capture.resumeHtml,
        documentFonts: documentFontsStore.data,
        baseUrl: window.location.href
    });
    saveAs(archive, filename.replace(/\.html?$/i, '.zip'));
}

async function capturePrintableResume(
    source: ResumeDocumentSource,
    target: Extract<ResumeRenderTarget, 'print' | 'export'>
): Promise<{ html: string; resumeHtml: string; stylesheet: string }> {
    const prepared = prepareResumeDocument(source, target);
    const mounted = await mountResumeDocument(prepared);
    let geometry: Readonly<Record<string, string>>;
    try {
        // Exclude the browser's default body margin while honoring authored physical insets.
        const reset = mounted.document.createElement('style');
        reset.textContent = ':where(body) { margin: 0; }';
        mounted.document.head.prepend(reset);
        mounted.document.body.style.removeProperty('margin');
        geometry = getResumePrintGeometry(mounted.document.body, prepared.pageSize);
    } finally {
        mounted.dispose();
    }
    const stylesheetWithPageSize = `${pageSizeRule(prepared.pageSize, geometry)}\n${prepared.stylesheet}`;
    const resumeHtml = await renderResumeMarkup(prepared);
    const html = documentFontsStore.data
        ? generateHtml(stylesheetWithPageSize, resumeHtml, documentFontsStore.data)
        : generateHtml(stylesheetWithPageSize, resumeHtml);
    return { html, resumeHtml, stylesheet: stylesheetWithPageSize };
}

/**
 * Print infrastructure shared by the print window and HTML export. Template
 * backgrounds are part of the authored design, so request exact colors instead
 * of relying on the browser's "Background graphics" option. The property is
 * inherited and applied at the root without !important, so authored CSS may
 * still opt an element back into economy printing.
 */
const printDocumentRules = (geometry: Readonly<Record<string, string>>, pageSize: PageSize) => [
    '@media print {',
    getResumeFragmentRules(geometry),
    '    html:root { display: block !important; width: auto !important; min-width: 0 !important; max-width: none !important; margin: 0 !important; padding: 0 !important; column-count: auto !important; column-height: auto !important; column-wrap: nowrap !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }',
    `    body { ${Object.entries(geometry).map(([key, value]) => `${key}: ${value} !important;`).join(' ')} }`,
    getResumePaginationRules(pageSize),
    '}'
].join('\n');

function pageSizeRule(pageSize: PageSize, geometry: Readonly<Record<string, string>>): string {
    const pageRule = pageSize === PageSize.A4
        ? '@page { size: A4; margin: 0; }'
        : '@page { size: Letter; margin: 0; }';
    return `${pageRule}\n${printDocumentRules(geometry, pageSize)}`;
}

function showPrintLoadingState(printWindow: Window): void {
    printWindow.document.open();
    printWindow.document.write('<!doctype html><title>Preparing resume</title><p>Preparing print preview…</p>');
    printWindow.document.close();
}

async function waitForPrintableDocument(printWindow: Window): Promise<void> {
    await waitForResumeDocumentAssets(printWindow.document);
}
