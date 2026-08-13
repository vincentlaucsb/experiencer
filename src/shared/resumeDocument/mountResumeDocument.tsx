import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import ResumeRenderer from '@/resume/ResumeRenderer';
import {
    configureResumeDocumentBody,
    installResumeDocumentHead
} from '@/shared/resumeDocument/browserResumeDocument';
import type { PreparedResumeDocument } from '@/shared/resumeDocument/prepareResumeDocument';

const noopUpdate = () => undefined;

export interface MountedResumeDocument {
    iframe: HTMLIFrameElement;
    document: Document;
    dispose: () => void;
}

function waitForFrame(iframe: HTMLIFrameElement): Promise<Document> {
    return new Promise((resolve, reject) => {
        iframe.addEventListener('load', () => {
            const frameDocument = iframe.contentDocument;
            if (frameDocument) resolve(frameDocument);
            else reject(new Error('The résumé document frame could not be opened.'));
        }, { once: true });
        iframe.srcdoc = '<!doctype html><html><head></head><body></body></html>';
    });
}

async function waitForImages(target: Document): Promise<void> {
    await Promise.all(Array.from(target.images).map(async (image) => {
        if (!image.complete) {
            await new Promise<void>((resolve) => {
                image.addEventListener('load', () => resolve(), { once: true });
                image.addEventListener('error', () => resolve(), { once: true });
            });
        }
        try {
            await image.decode();
        } catch {
            // An optional broken image must not block document capture.
        }
    }));
}

/** Mounts a standalone document in an off-screen isolated browser for visual capture. */
export async function mountResumeDocument(
    prepared: PreparedResumeDocument,
    ownerDocument: Document = document
): Promise<MountedResumeDocument> {
    if (prepared.root !== 'document-body') {
        throw new Error('Only standalone résumé documents can be mounted in an isolated frame.');
    }

    const iframe = ownerDocument.createElement('iframe');
    iframe.title = prepared.ariaLabel;
    Object.assign(iframe.style, {
        position: 'fixed',
        left: '-100000px',
        top: '0',
        width: prepared.width,
        height: prepared.minHeight,
        border: '0',
        pointerEvents: 'none'
    });
    ownerDocument.body.appendChild(iframe);

    let root: Root | undefined;
    let removeHead: () => void = () => undefined;
    let restoreBody: () => void = () => undefined;
    try {
        const frameDocument = await waitForFrame(iframe);
        removeHead = installResumeDocumentHead(frameDocument, prepared);
        restoreBody = configureResumeDocumentBody(frameDocument, prepared);
        root = createRoot(frameDocument.body);
        flushSync(() => {
            root!.render(
                <ResumeRenderer
                    nodes={prepared.nodes}
                    pageSize={prepared.pageSize}
                    ariaLabel={prepared.ariaLabel}
                    readOnly
                    root="document-body"
                    updateResumeData={noopUpdate}
                    updateResumeDataFields={noopUpdate}
                />
            );
        });
        await frameDocument.fonts.ready;
        await waitForImages(frameDocument);
        const frameWindow = iframe.contentWindow;
        if (frameWindow) {
            await new Promise<void>((resolve) => frameWindow.requestAnimationFrame(() => resolve()));
        }

        return {
            iframe,
            document: frameDocument,
            dispose: () => {
                flushSync(() => root?.unmount());
                restoreBody();
                removeHead();
                iframe.remove();
            }
        };
    } catch (error) {
        flushSync(() => root?.unmount());
        restoreBody();
        removeHead();
        iframe.remove();
        throw error;
    }
}
