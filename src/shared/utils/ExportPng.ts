import html2canvas from 'html2canvas';
import { mountResumeDocument } from '@/shared/resumeDocument/mountResumeDocument';
import {
    prepareResumeDocument,
    type ResumeDocumentSource
} from '@/shared/resumeDocument/prepareResumeDocument';

function createAbortError(): Error {
    const error = new Error('PNG export was cancelled.');
    error.name = 'AbortError';
    return error;
}

function throwIfAborted(signal?: AbortSignal): void {
    if (signal?.aborted) {
        throw createAbortError();
    }
}

/** Replaces html2canvas's oversized text-based list markers in the capture clone. */
export function normalizeListMarkersForPng(document: Document): void {
    const resume = document.querySelector<HTMLElement>('[data-resume-document]')
        ?? document.body;
    if (!resume) return;

    // Page boundaries are editor guidance only and must not become part of an AI-review image.
    resume.querySelectorAll('.resume-page-boundaries').forEach((boundary) => boundary.remove());

    resume.querySelectorAll<HTMLElement>('ul > li, ol > li').forEach((item) => {
        const list = item.parentElement;
        if (!list) return;

        const computedStyle = document.defaultView?.getComputedStyle(item);
        const listStyleType = computedStyle?.listStyleType;
        if (!listStyleType || listStyleType === 'none') return;

        let markerStyle: CSSStyleDeclaration | undefined;
        const userAgent = document.defaultView?.navigator.userAgent ?? '';
        if (!/jsdom/i.test(userAgent)) {
            try {
                markerStyle = document.defaultView?.getComputedStyle(item, '::marker');
            } catch {
                // Browsers without pseudo-element style support use the item style fallback.
            }
        }

        const fontSizePx = Number.parseFloat(computedStyle?.fontSize ?? '');
        const computedLineHeightPx = Number.parseFloat(computedStyle?.lineHeight ?? '');
        const lineHeightPx = Number.isFinite(computedLineHeightPx)
            ? computedLineHeightPx
            : Number.isFinite(fontSizePx)
              ? fontSizePx * 1.2
              : 16 * 1.2;

        const marker = document.createElement('span');
        const itemIndex = Array.from(list.children)
            .filter((child) => child.tagName === 'LI')
            .indexOf(item) + 1;
        const isOrderedList = list.tagName === 'OL';
        const isCircleMarker = listStyleType === 'circle';
        const markerText = isOrderedList ? `${itemIndex}.` : '';

        marker.textContent = markerText;
        marker.setAttribute('aria-hidden', 'true');
        marker.style.position = 'absolute';
        marker.style.left = '-1.15em';
        marker.style.top = `${lineHeightPx / 2}px`;
        marker.style.transform = 'translateY(-50%)';
        marker.style.width = isOrderedList ? '0.9em' : '0.5em';
        marker.style.height = isOrderedList ? 'auto' : '0.5em';
        marker.style.fontSize = markerStyle?.fontSize || (isOrderedList ? '0.65em' : 'inherit');
        marker.style.lineHeight = isOrderedList ? '1' : '0.5em';
        marker.style.textAlign = 'center';
        if (!isOrderedList) {
            marker.style.backgroundColor = markerStyle?.color || computedStyle.color || '#000000';
            marker.style.borderRadius = isCircleMarker || listStyleType === 'disc' ? '50%' : '0';
        }

        item.style.listStyleType = 'none';
        item.style.position = 'relative';
        item.insertBefore(marker, item.firstChild);
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, signal?: AbortSignal): Promise<Blob> {
    return new Promise((resolve, reject) => {
        let settled = false;

        const cleanup = () => {
            signal?.removeEventListener('abort', handleAbort);
        };

        const finish = (callback: () => void) => {
            if (settled) return;
            settled = true;
            cleanup();
            callback();
        };

        const handleAbort = () => finish(() => reject(createAbortError()));
        signal?.addEventListener('abort', handleAbort, { once: true });

        try {
            canvas.toBlob((blob) => {
                finish(() => {
                    if (signal?.aborted) {
                        reject(createAbortError());
                    } else if (blob) {
                        resolve(blob);
                    } else {
                        reject(new Error('Failed to create a PNG from the resume.'));
                    }
                });
            }, 'image/png');
        } catch (error) {
            finish(() => reject(error));
        }
    });
}

/** Captures the resume element as a PNG blob without owning presentation UI. */
export async function captureResumePng(
    source: ResumeDocumentSource,
    signal?: AbortSignal
): Promise<Blob> {
    throwIfAborted(signal);
    const mounted = await mountResumeDocument(prepareResumeDocument(source, 'png'));
    try {
        throwIfAborted(signal);
        const canvas = await html2canvas(mounted.document.body, {
            scale: 6,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: normalizeListMarkersForPng
        });

        throwIfAborted(signal);
        return await canvasToBlob(canvas, signal);
    } finally {
        mounted.dispose();
    }
}
