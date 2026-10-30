/** Wait for owned font CSS before FontFaceSet, then image dimensions, before measuring page flows. */
export async function waitForResumeDocumentAssets(doc: Document): Promise<void> {
    for (const link of Array.from(doc.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'))) {
        if (link.sheet) continue;
        await new Promise<void>((resolve, reject) => {
            const finish = (error?: Error) => {
                clearTimeout(timeout);
                link.removeEventListener('load', loaded);
                link.removeEventListener('error', failed);
                if (error) reject(error); else resolve();
            };
            const loaded = () => finish();
            const failed = () => finish(new Error('The resume font stylesheet could not be loaded.'));
            const timeout = setTimeout(() => finish(new Error('The resume font stylesheet timed out.')), 15_000);
            link.addEventListener('load', loaded, {once: true});
            link.addEventListener('error', failed, {once: true});
            if (link.sheet) loaded();
        });
    }
    await frame(doc);
    await doc.fonts?.ready;
    await Promise.all(Array.from(doc.images).map(async image => {
        if (!image.complete) await new Promise<void>(resolve => {
            image.addEventListener('load', () => resolve(), {once: true});
            image.addEventListener('error', () => resolve(), {once: true});
        });
        try { await image.decode(); } catch { /* Optional broken images must not block capture. */ }
    }));
    await frame(doc);
}

function frame(doc: Document): Promise<void> {
    const view = doc.defaultView;
    if (!view) return Promise.reject(new Error('The resume document is detached.'));
    return new Promise(resolve => view.requestAnimationFrame(() => resolve()));
}
