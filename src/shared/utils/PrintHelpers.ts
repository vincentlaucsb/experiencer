import { saveAs } from 'file-saver';
import { useEditorStore } from '@/shared/stores/editorStore';
import generateHtml from '@/editor/GenerateHtml';

/**
 * Print the resume using browser's print dialog.
 * Temporarily switches to print mode, triggers print, then restores mode.
 */
export function printResume() {
    requestAnimationFrame(() => {
        const prevMode = useEditorStore.getState().mode;

        useEditorStore.getState().unselectNode();
        useEditorStore.getState().setMode('printing');

        window.print();

        useEditorStore.getState().setMode(prevMode);
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
    const prevMode = useEditorStore.getState().mode;
    useEditorStore.getState().unselectNode();
    useEditorStore.getState().setMode('printing');

    // Wait for render to complete before capturing HTML
    requestAnimationFrame(() => {
        const resumeHtml = resumeElement ? resumeElement.outerHTML : '';
        const blob = new Blob(
            [generateHtml(stylesheet, resumeHtml)],
            { type: "text/html;charset=utf-8" }
        );

        saveAs(blob, filename);
        
        // Restore previous mode
        useEditorStore.getState().setMode(prevMode);
    });
}
