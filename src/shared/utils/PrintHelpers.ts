import { saveAs } from 'file-saver';
import { useEditorStore } from '@/shared/stores/editorStore';
import { workspaceStore } from '@/shared/stores/workspaceStore';
import generateHtml from '@/editor/GenerateHtml';
import PageSize from '@/types/PageSize';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';

/**
 * Print the resume using browser's print dialog.
 * Temporarily switches to print mode, triggers print, then restores mode.
 */
export function printResume() {
    requestAnimationFrame(() => {
        const previousWorkspace = workspaceStore.getSnapshot();

        useEditorStore.getState().unselectNode();
        if (!workspaceStore.startPrinting()) return;

        window.print();

        workspaceStore.restore(previousWorkspace);
    });
}

/**
 * Export resume as standalone HTML file.
 * Temporarily switches to print mode to ensure proper rendering (e.g., links as <a> tags).
 * 
 * @param resumeElement - The resume DOM element to export
 * @param stylesheet - The CSS stylesheet to include
 * @param filename - Output filename (default: 'resume.html')
 */
export function exportResumeAsHtml(
    resumeElement: HTMLElement | null,
    stylesheet: string,
    filename: string = 'resume.html'
) {
    const previousWorkspace = workspaceStore.getSnapshot();
    const pageSize = useEditorStore.getState().pageSize;
    const pageSizeRule = pageSize === PageSize.A4
        ? '@page { size: A4; }'
        : '@page { size: Letter; }';

    useEditorStore.getState().unselectNode();
    if (!workspaceStore.startPrinting()) return;

    // Wait for render to complete before capturing HTML
    requestAnimationFrame(() => {
        const resumeHtml = resumeElement ? resumeElement.outerHTML : '';
        const stylesheetWithPageSize = `${pageSizeRule}\n${stylesheet}`;
        const generatedHtml = documentFontsStore.data
            ? generateHtml(stylesheetWithPageSize, resumeHtml, documentFontsStore.data)
            : generateHtml(stylesheetWithPageSize, resumeHtml);
        const blob = new Blob(
            [generatedHtml],
            { type: "text/html;charset=utf-8" }
        );

        saveAs(blob, filename);
        
        // Restore previous mode
        workspaceStore.restore(previousWorkspace);
    });
}
