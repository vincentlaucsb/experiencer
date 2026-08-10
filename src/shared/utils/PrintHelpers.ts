import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import { useEditorStore } from '@/shared/stores/editorStore';
import { workspaceStore } from '@/shared/stores/workspaceStore';
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
    const previousWorkspace = workspaceStore.getSnapshot();
    const pageSize = useEditorStore.getState().pageSize;
    const stylesheetWithPageSize = `${pageSizeRule(pageSize)}\n${stylesheet}`;
    const alreadyPrinting = previousWorkspace.mode === 'printing';

    useEditorStore.getState().unselectNode();
    if (!alreadyPrinting && !workspaceStore.startPrinting()) {
        throw new Error('Open a resume before printing or exporting it.');
    }

    try {
        await nextAnimationFrame(window);
        const resumeHtml = resumeElement?.outerHTML;
        if (!resumeHtml) {
            throw new Error('The resume could not be rendered.');
        }
        const html = documentFontsStore.data
            ? generateHtml(stylesheetWithPageSize, resumeHtml, documentFontsStore.data)
            : generateHtml(stylesheetWithPageSize, resumeHtml);
        return { html, resumeHtml, stylesheet: stylesheetWithPageSize };
    } finally {
        if (!alreadyPrinting) workspaceStore.restore(previousWorkspace);
    }
}

function pageSizeRule(pageSize: PageSize): string {
    return pageSize === PageSize.A4
        ? '@page { size: A4; margin: 0; }'
        : '@page { size: Letter; margin: 0; }';
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
