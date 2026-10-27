import PageSize from '@/types/PageSize';
import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import { useEditorStore } from '@/shared/stores/editorStore';
import { resumeTextOverflowStore } from '@/shared/stores/resumeTextOverflowStore';
import { pngExportStore } from '@/shared/stores/pngExportStore';
import { showToast } from '@/shared/stores/toastStore';
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';

const PRINT_PAGE_SIZE_STYLE_ID = 'print-page-size-style';

export interface ResumeOutputPorts {
    exportHtml(source: ResumeDocumentSource, filename: string): Promise<void>;
    print(source: ResumeDocumentSource): Promise<void>;
    startPng(source: ResumeDocumentSource): void;
    showError(message: string): void;
    hasTextOverflow?(): boolean;
}

const browserPorts: ResumeOutputPorts = {
    exportHtml: exportResumeAsHtml,
    print: printResume,
    startPng: (source) => pngExportStore.start(source),
    showError: showToast,
    hasTextOverflow: () => resumeTextOverflowStore.measureCurrent().count > 0
};

function printPageSizeCss(pageSize: PageSize): string {
    return `@page { size: ${pageSize === PageSize.A4 ? 'A4' : 'Letter'}; }`;
}

/**
 * Owns HTML, print, and PNG commands independently of React.
 * PNG resource ownership remains in pngExportStore.
 */
export class ResumeOutputController {
    private pendingPrint?: ResumeDocumentSource;
    private readonly printReviewListeners = new Set<() => void>();
    constructor(private readonly ports: ResumeOutputPorts = browserPorts) {}

    /** Binds the visible canvas and drops its private print snapshot when that editor leaves. */
    bindEditor(root: HTMLElement, pageSize: PageSize): () => void {
        const dispose = resumeTextOverflowStore.bind(root, pageSize);
        return () => { dispose(); this.cancelPrintReview(); };
    }

    getPrintReviewSnapshot = () => Boolean(this.pendingPrint);
    subscribePrintReview = (listener: () => void) => {
        this.printReviewListeners.add(listener);
        return () => this.printReviewListeners.delete(listener);
    };
    cancelPrintReview = () => {
        this.pendingPrint = undefined;
        this.printReviewListeners.forEach(listener => listener());
    };
    continuePrint = () => {
        const source = this.pendingPrint;
        this.cancelPrintReview();
        // The explicit continue click opens the popup synchronously, preserving browser gesture rules.
        if (source) this.printImmediately(source);
    };

    exportHtml(source: ResumeDocumentSource): void {
        void this.ports.exportHtml(source, 'resume.zip').catch((error: unknown) => {
            this.ports.showError(
                error instanceof Error ? error.message : 'Could not export the HTML package.'
            );
        });
    }

    print(source: ResumeDocumentSource): void {
        if (this.ports.hasTextOverflow?.()) {
            this.pendingPrint = source;
            this.printReviewListeners.forEach(listener => listener());
            return;
        }
        this.printImmediately(source);
    }

    private printImmediately(source: ResumeDocumentSource): void {
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
