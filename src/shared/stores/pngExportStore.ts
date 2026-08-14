import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import { captureResumePng } from '@/shared/utils/ExportPng';

export type PngExportPhase = 'idle' | 'loading' | 'ready' | 'error';
export type PngCopyPhase = 'idle' | 'copying' | 'copied' | 'error';

export interface PngExportSnapshot {
    phase: PngExportPhase;
    imageUrl?: string;
    errorMessage?: string;
    copyPhase: PngCopyPhase;
}

export interface PngExportEnvironment {
    capture(source: ResumeDocumentSource, signal: AbortSignal): Promise<Blob>;
    createObjectUrl(blob: Blob): string;
    revokeObjectUrl(url: string): void;
    copyPng(blob: Blob): Promise<void>;
    download(url: string, filename: string): void;
    now(): number;
}

export interface PngExportController {
    subscribe(listener: () => void): () => void;
    getSnapshot(): PngExportSnapshot;
    start(source: ResumeDocumentSource): void;
    close(): void;
    copy(): Promise<void>;
    download(): void;
}

const idleSnapshot: PngExportSnapshot = {
    phase: 'idle',
    copyPhase: 'idle'
};

const browserEnvironment: PngExportEnvironment = {
    capture: captureResumePng,
    createObjectUrl: (blob) => URL.createObjectURL(blob),
    revokeObjectUrl: (url) => URL.revokeObjectURL(url),
    copyPng: async (blob) => {
        if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
            throw new Error('Clipboard image access is unavailable.');
        }

        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
        ]);
    },
    download: (url, filename) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
    now: () => Date.now()
};

/** Owns the PNG export workflow and its browser-resource lifecycle outside React. */
export class PngExportStore implements PngExportController {
    private snapshot = idleSnapshot;
    private readonly listeners = new Set<() => void>();
    private requestId = 0;
    private abortController?: AbortController;
    private blob?: Blob;
    private objectUrl?: string;

    constructor(private readonly environment: PngExportEnvironment) {}

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.snapshot;

    start = (source: ResumeDocumentSource): void => {
        this.cancelCapture();
        this.releaseResult();

        const requestId = ++this.requestId;
        const controller = new AbortController();
        this.abortController = controller;
        this.setSnapshot({ phase: 'loading', copyPhase: 'idle' });

        void this.environment.capture(source, controller.signal)
            .then((blob) => {
                if (!this.isCurrentRequest(requestId, controller)) return;

                const objectUrl = this.environment.createObjectUrl(blob);
                this.abortController = undefined;
                this.blob = blob;
                this.objectUrl = objectUrl;
                this.setSnapshot({
                    phase: 'ready',
                    imageUrl: objectUrl,
                    copyPhase: 'idle'
                });
            })
            .catch((error: unknown) => {
                if (!this.isCurrentRequest(requestId, controller)) return;

                this.abortController = undefined;
                this.setSnapshot({
                    phase: 'error',
                    errorMessage: error instanceof Error
                        ? error.message
                        : 'Could not generate the PNG.',
                    copyPhase: 'idle'
                });
            });
    };

    close = (): void => {
        if (this.snapshot.phase === 'idle' && !this.abortController && !this.objectUrl) {
            return;
        }

        ++this.requestId;
        this.cancelCapture();
        this.releaseResult();
        this.setSnapshot(idleSnapshot);
    };

    copy = async (): Promise<void> => {
        if (this.snapshot.phase !== 'ready' || !this.blob
            || this.snapshot.copyPhase === 'copying') {
            return;
        }

        const requestId = this.requestId;
        const blob = this.blob;
        this.setSnapshot({ ...this.snapshot, copyPhase: 'copying' });

        try {
            await this.environment.copyPng(blob);
            if (!this.isCurrentResult(requestId, blob)) return;
            this.setSnapshot({ ...this.snapshot, copyPhase: 'copied' });
        } catch {
            if (!this.isCurrentResult(requestId, blob)) return;
            this.setSnapshot({ ...this.snapshot, copyPhase: 'error' });
        }
    };

    download = (): void => {
        if (this.snapshot.phase !== 'ready' || !this.objectUrl) return;
        this.environment.download(
            this.objectUrl,
            `resume-${this.environment.now()}.png`
        );
    };

    private isCurrentRequest(requestId: number, controller: AbortController): boolean {
        return requestId === this.requestId
            && this.abortController === controller
            && !controller.signal.aborted;
    }

    private isCurrentResult(requestId: number, blob: Blob): boolean {
        return requestId === this.requestId
            && this.snapshot.phase === 'ready'
            && this.blob === blob;
    }

    private cancelCapture(): void {
        this.abortController?.abort();
        this.abortController = undefined;
    }

    private releaseResult(): void {
        if (this.objectUrl) {
            this.environment.revokeObjectUrl(this.objectUrl);
        }
        this.objectUrl = undefined;
        this.blob = undefined;
    }

    private setSnapshot(snapshot: PngExportSnapshot): void {
        this.snapshot = snapshot;
        this.listeners.forEach((listener) => listener());
    }
}

export const pngExportStore = new PngExportStore(browserEnvironment);
