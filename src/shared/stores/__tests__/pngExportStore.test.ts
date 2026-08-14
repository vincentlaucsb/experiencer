import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import {
    PngExportStore,
    type PngExportEnvironment
} from '@/shared/stores/pngExportStore';
import PageSize from '@/types/PageSize';

const source: ResumeDocumentSource = {
    nodes: [],
    stylesheet: '',
    pageSize: PageSize.Letter,
    ariaLabel: 'Test resume'
};

function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

function createEnvironment(): jest.Mocked<PngExportEnvironment> {
    return {
        capture: jest.fn(),
        createObjectUrl: jest.fn((_blob: Blob) => 'blob:resume-preview'),
        revokeObjectUrl: jest.fn((_url: string) => undefined),
        copyPng: jest.fn(async (_blob: Blob) => undefined),
        download: jest.fn((_url: string, _filename: string) => undefined),
        now: jest.fn(() => 1234)
    };
}

test('captures a snapshot of the requested document and owns the result URL', async () => {
    const capture = deferred<Blob>();
    const environment = createEnvironment();
    environment.capture.mockReturnValue(capture.promise);
    const store = new PngExportStore(environment);
    const listener = jest.fn();
    store.subscribe(listener);

    store.start(source);

    expect(store.getSnapshot()).toEqual({ phase: 'loading', copyPhase: 'idle' });
    expect(environment.capture).toHaveBeenCalledWith(source, expect.any(AbortSignal));

    const blob = new Blob(['png'], { type: 'image/png' });
    capture.resolve(blob);
    await capture.promise;
    await Promise.resolve();

    expect(store.getSnapshot()).toEqual({
        phase: 'ready',
        imageUrl: 'blob:resume-preview',
        copyPhase: 'idle'
    });
    expect(environment.createObjectUrl).toHaveBeenCalledWith(blob);

    store.download();
    expect(environment.download).toHaveBeenCalledWith(
        'blob:resume-preview',
        'resume-1234.png'
    );

    store.close();
    expect(environment.revokeObjectUrl).toHaveBeenCalledWith('blob:resume-preview');
    expect(store.getSnapshot()).toEqual({ phase: 'idle', copyPhase: 'idle' });
    expect(listener).toHaveBeenCalledTimes(3);
});

test('reports capture failures without creating an object URL', async () => {
    const environment = createEnvironment();
    environment.capture.mockRejectedValue(new Error('Capture failed.'));
    const store = new PngExportStore(environment);

    store.start(source);
    await Promise.resolve();
    await Promise.resolve();

    expect(store.getSnapshot()).toEqual({
        phase: 'error',
        errorMessage: 'Capture failed.',
        copyPhase: 'idle'
    });
    expect(environment.createObjectUrl).not.toHaveBeenCalled();
});

test('cancels the previous capture and ignores its late result', async () => {
    const firstCapture = deferred<Blob>();
    const secondCapture = deferred<Blob>();
    const environment = createEnvironment();
    environment.capture
        .mockReturnValueOnce(firstCapture.promise)
        .mockReturnValueOnce(secondCapture.promise);
    const store = new PngExportStore(environment);

    store.start(source);
    const firstSignal = environment.capture.mock.calls[0][1];
    store.start({ ...source, ariaLabel: 'Newer resume' });

    expect(firstSignal.aborted).toBe(true);

    firstCapture.resolve(new Blob(['old'], { type: 'image/png' }));
    await firstCapture.promise;
    await Promise.resolve();
    expect(store.getSnapshot().phase).toBe('loading');
    expect(environment.createObjectUrl).not.toHaveBeenCalled();

    const latestBlob = new Blob(['new'], { type: 'image/png' });
    secondCapture.resolve(latestBlob);
    await secondCapture.promise;
    await Promise.resolve();

    expect(store.getSnapshot().phase).toBe('ready');
    expect(environment.createObjectUrl).toHaveBeenCalledTimes(1);
    expect(environment.createObjectUrl).toHaveBeenCalledWith(latestBlob);
});

test('copies the ready PNG and exposes clipboard feedback', async () => {
    const blob = new Blob(['png'], { type: 'image/png' });
    const environment = createEnvironment();
    environment.capture.mockResolvedValue(blob);
    const store = new PngExportStore(environment);

    store.start(source);
    await Promise.resolve();
    await Promise.resolve();
    await store.copy();

    expect(environment.copyPng).toHaveBeenCalledWith(blob);
    expect(store.getSnapshot().copyPhase).toBe('copied');

    environment.copyPng.mockRejectedValueOnce(new Error('Clipboard denied.'));
    await store.copy();
    expect(store.getSnapshot().copyPhase).toBe('error');
});

test('does not publish late clipboard completion after the export closes', async () => {
    const clipboardWrite = deferred<void>();
    const environment = createEnvironment();
    environment.capture.mockResolvedValue(new Blob(['png'], { type: 'image/png' }));
    environment.copyPng.mockReturnValue(clipboardWrite.promise);
    const store = new PngExportStore(environment);

    store.start(source);
    await Promise.resolve();
    await Promise.resolve();

    const copy = store.copy();
    expect(store.getSnapshot().copyPhase).toBe('copying');
    store.close();

    clipboardWrite.resolve();
    await copy;

    expect(store.getSnapshot()).toEqual({ phase: 'idle', copyPhase: 'idle' });
});

test('close is idempotent and aborts an active capture', () => {
    const environment = createEnvironment();
    environment.capture.mockReturnValue(new Promise<Blob>(() => undefined));
    const store = new PngExportStore(environment);

    store.start(source);
    const signal = environment.capture.mock.calls[0][1];
    store.close();
    store.close();

    expect(signal.aborted).toBe(true);
    expect(store.getSnapshot()).toEqual({ phase: 'idle', copyPhase: 'idle' });
    expect(environment.revokeObjectUrl).not.toHaveBeenCalled();
});
