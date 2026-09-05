import { fitPreviewFrameToDocument } from '../fitPreviewFrameToDocument';

test('fits an opted-in frame and restores its dimensions on teardown', () => {
    const frame = document.createElement('iframe');
    frame.style.width = '100%';
    frame.style.height = '400px';
    document.body.append(frame);
    const body = frame.contentDocument!.body;
    // JSDOM has no layout engine; dimensions and resize notifications are browser boundaries.
    let height = 1056;
    jest.spyOn(body, 'getBoundingClientRect').mockImplementation(() => ({
        width: 816, height, top: 0
    } as DOMRect));
    let notify = () => {};
    const disconnect = jest.fn();
    const previousObserver = global.ResizeObserver;
    global.ResizeObserver = jest.fn(callback => {
        notify = () => callback([], {} as ResizeObserver);
        return { observe: jest.fn(), disconnect, unobserve: jest.fn() };
    });
    try {
        expect(fitPreviewFrameToDocument(frame.contentDocument)).toBeUndefined();
        expect(frame.style.width).toBe('100%');
        const cleanup = fitPreviewFrameToDocument(frame.contentDocument, true)!;
        expect(frame.style.width).toBe('816px');
        expect(frame.style.height).toBe('1056px');
        height = 2200.5;
        notify();
        expect(frame.style.height).toBe('2201px');
        height = 1056;
        notify();
        expect(frame.style.height).toBe('1056px');
        jest.spyOn(frame.contentDocument!.documentElement, 'getBoundingClientRect')
            .mockReturnValue({ height: 1088 } as DOMRect);
        notify();
        expect(frame.style.height).toBe('1088px');
        cleanup();
        expect(disconnect).toHaveBeenCalledTimes(1);
        expect(frame.style.width).toBe('100%');
        expect(frame.style.height).toBe('400px');
    } finally {
        global.ResizeObserver = previousObserver;
        frame.remove();
        jest.restoreAllMocks();
    }
});
