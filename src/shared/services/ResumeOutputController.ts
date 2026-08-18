import PageSize from '@/types/PageSize';
import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import { useEditorStore } from '@/shared/stores/editorStore';
import { pngExportStore } from '@/shared/stores/pngExportStore';
import { showToast } from '@/shared/stores/toastStore';
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';

const PRINT_PAGE_SIZE_STYLE_ID = 'print-page-size-style';

export interface ResumeOutputPorts {
    exportHtml(source: ResumeDocumentSource, filename: string): Promise<void>;
    print(source: ResumeDocumentSource): Promise<void>;
    startPng(source: ResumeDocumentSource): void;
    showError(message: string): void;
}

const browserPorts: ResumeOutputPorts = {
    exportHtml: exportResumeAsHtml,
    print: printResume,
    startPng: (source) => pngExportStore.start(source),
    showError: showToast
};

function printPageSizeCss(pageSize: PageSize): string {
    return `@page { size: ${pageSize === PageSize.A4 ? 'A4' : 'Letter'}; }`;
}

/**
 * Owns HTML, print, and PNG commands independently of React.
 * PNG resource ownership remains in pngExportStore.
 */
export class ResumeOutputController {
    constructor(private readonly ports: ResumeOutputPorts = browserPorts) {}

    exportHtml(source: ResumeDocumentSource): void {
        void this.ports.exportHtml(source, 'resume.zip').catch((error: unknown) => {
            this.ports.showError(
                error instanceof Error ? error.message : 'Could not export the HTML package.'
            );
        });
    }

    print(source: ResumeDocumentSource): void {
        void this.ports.print(source).catch((error: unknown) => {
            this.ports.showError(
                error instanceof Error ? error.message : 'Could not open the print preview.'
            );
        });
    }

    exportPng(source: ResumeDocumentSource): void {
        this.ports.startPng(source);
    }

    /**
     * Registers the isolated print shortcut and keeps the document page-size rule current.
     */
    bindBrowserOutput(getSource: () => ResumeDocumentSource): () => void {
        if (typeof window === 'undefined' || typeof document === 'undefined') {
            return () => undefined;
        }

        const onPrintShortcut = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'p') {
                event.preventDefault();
                this.print(getSource());
            }
        };

        this.syncPrintPageSize(useEditorStore.getState().pageSize);
        window.addEventListener('keydown', onPrintShortcut);
        const unsubscribePageSize = useEditorStore.subscribe((state, previous) => {
            if (state.pageSize !== previous.pageSize) {
                this.syncPrintPageSize(state.pageSize);
            }
        });

        return () => {
            window.removeEventListener('keydown', onPrintShortcut);
            unsubscribePageSize();
        };
    }

    private syncPrintPageSize(pageSize: PageSize): void {
        if (typeof document === 'undefined') return;

        let styleElement = document.getElementById(PRINT_PAGE_SIZE_STYLE_ID) as HTMLStyleElement | null;
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = PRINT_PAGE_SIZE_STYLE_ID;
            styleElement.media = 'print';
            document.head.appendChild(styleElement);
        }
        styleElement.textContent = printPageSizeCss(pageSize);
    }
}

export const resumeOutputController = new ResumeOutputController();
