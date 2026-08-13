import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import { useEditorStore } from '@/shared/stores/editorStore';
import { buildHtmlExportPackage } from '@/shared/utils/HtmlExportPackage';
import PageSize from '@/types/PageSize';

/** Opens a resume-only tab and invokes the browser print dialog after its assets settle. */
export async function printResume(
    resumeElement: HTMLElement | null,
    stylesheet: string
): Promise<void> {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        throw new Error('The print preview was blocked. Allow pop-ups and try again.');
    }
    showPrintLoadingState(printWindow);

    let capture: Awaited<ReturnType<typeof capturePrintableResume>>;
    try {
        capture = await capturePrintableResume(resumeElement, stylesheet);
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
    resumeElement: HTMLElement | null,
    stylesheet: string,
    filename: string = 'resume.zip'
): Promise<void> {
    const capture = await capturePrintableResume(resumeElement, stylesheet);
    const archive = await buildHtmlExportPackage({
        stylesheet: capture.stylesheet,
        resumeHtml: capture.resumeHtml,
        documentFonts: documentFontsStore.data,
        baseUrl: window.location.href
    });
    saveAs(archive, filename.replace(/\.html?$/i, '.zip'));
}

async function capturePrintableResume(
    resumeElement: HTMLElement | null,
    stylesheet: string
): Promise<{ html: string; resumeHtml: string; stylesheet: string }> {
    const pageSize = useEditorStore.getState().pageSize;
    const stylesheetWithPageSize = `${pageSizeRule(pageSize)}\n${stylesheet}`;

    useEditorStore.getState().unselectNode();
    await nextAnimationFrame(window);

    const resumeHtml = createPrintableResumeHtml(resumeElement);
    const html = documentFontsStore.data
        ? generateHtml(stylesheetWithPageSize, resumeHtml, documentFontsStore.data)
        : generateHtml(stylesheetWithPageSize, resumeHtml);
    return { html, resumeHtml, stylesheet: stylesheetWithPageSize };
}

/** Creates a print-safe snapshot without changing the live editor's workspace state. */
export function createPrintableResumeHtml(resumeElement: HTMLElement | null): string {
    if (!resumeElement) {
        throw new Error('The resume could not be rendered.');
    }

    const printableResume = resumeElement.cloneNode(true) as HTMLElement;
    printableResume.querySelectorAll('.no-print').forEach((element) => element.remove());
    printableResume.querySelectorAll('.page-break-label').forEach((element) => element.remove());
    printableResume.querySelectorAll('.page-break-editing').forEach((element) => {
        element.classList.remove('page-break-editing');
    });

    return printableResume.outerHTML;
}

function pageSizeRule(pageSize: PageSize): string {
    const pageRule = pageSize === PageSize.A4
        ? '@page { size: A4; margin: 0; }'
        : '@page { size: Letter; margin: 0; }';
    return `${pageRule}\n@media print { #resume { min-height: 0 !important; } }`;
}

function showPrintLoadingState(printWindow: Window): void {
    printWindow.document.open();
    printWindow.document.write('<!doctype html><title>Preparing resume</title><p>Preparing print preview…</p>');
    printWindow.document.close();
}

async function waitForPrintableDocument(printWindow: Window): Promise<void> {
    const fonts = printWindow.document.fonts;
    if (fonts) await fonts.ready;
    await Promise.all(Array.from(printWindow.document.images).map(waitForImage));
    await nextAnimationFrame(printWindow);
    await nextAnimationFrame(printWindow);
}

async function waitForImage(image: HTMLImageElement): Promise<void> {
    if (!image.complete) {
        await new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true });
            image.addEventListener('error', () => resolve(), { once: true });
        });
    }
    try {
        await image.decode();
    } catch {
        // A broken optional image must not prevent the user from printing the document.
    }
}

function nextAnimationFrame(targetWindow: Window): Promise<void> {
    return new Promise((resolve) => targetWindow.requestAnimationFrame(() => resolve()));
}
