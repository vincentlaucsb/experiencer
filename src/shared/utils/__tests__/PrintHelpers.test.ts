import { saveAs } from 'file-saver';
import registerNodes from '@/resume/schema';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';
import PageSize from '@/types/PageSize';

jest.mock('file-saver', () => ({saveAs: jest.fn()}));

/** Supply only browser facilities JSDOM lacks; exercise the real renderer and ZIP builder. */
function supportDocumentFrames(): MutationObserver {
    const observer = new MutationObserver(() => {
        for (const frame of Array.from(document.querySelectorAll('iframe'))) {
            if (frame.dataset.testReady) continue;
            frame.dataset.testReady = 'true';
            const doc = frame.contentDocument!;
            doc.body.style.padding = '0';
            Object.defineProperty(doc, 'fonts', {value: {ready: Promise.resolve()}, configurable: true});
            frame.contentWindow!.requestAnimationFrame = callback => {callback(0); return 1;};
            queueMicrotask(() => frame.dispatchEvent(new Event('load')));
        }
    });
    observer.observe(document.body, {childList: true, subtree: true});
    return observer;
}

function blobText(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsText(blob);
    });
}

describe('resume printing and HTML export', () => {
    const save = saveAs as jest.MockedFunction<typeof saveAs>;
    let observer: MutationObserver;
    beforeAll(registerNodes);
    beforeEach(() => {
        jest.clearAllMocks();
        documentFontsStore.load(undefined);
        global.fetch = jest.fn(async () => {throw new Error('Unexpected font asset request');});
        observer = supportDocumentFrames();
    });
    afterEach(() => {observer.disconnect(); document.body.replaceChildren();});

    test.each([[PageSize.A4, 'A4'], [PageSize.Letter, 'Letter']])('packages the real %s document with shared print geometry', async (size, label) => {
        await exportResumeAsHtml(source(size), 'resume.html');
        const text = await blobText(save.mock.calls[0][0] as Blob);
        expect(text).toContain(`@page { size: ${label}; margin: 0; }`);
        expect(text).toContain('box-decoration-break: clone !important;');
        expect(text).toContain('print-color-adjust: exact;');
        expect(text).toContain('data-uuid="print-page-break"');
        expect(text).not.toContain('Page Break');
        expect(save).toHaveBeenCalledWith(expect.any(Blob), 'resume.zip');
        expect(document.querySelector('iframe')).toBeNull();
    });

    test('writes actual standalone markup to the popup and waits before printing', async () => {
        const popup = printWindow();
        const open = jest.spyOn(window, 'open').mockReturnValue(popup);
        try {
            await printResume(source(PageSize.Letter));
            const html = (popup.document.write as jest.Mock).mock.calls.at(-1)[0] as string;
            expect(html).toContain('data-uuid="print-page-break"');
            expect(html).toContain('box-decoration-break: clone');
            expect(html).not.toContain('Page Break');
            expect(popup.focus).toHaveBeenCalled();
            expect(popup.print).toHaveBeenCalled();
        } finally {open.mockRestore();}
    });

    test('print uses the captured document font manifest rather than another active document', async () => {
        const popup = printWindow();
        const open = jest.spyOn(window, 'open').mockReturnValue(popup);
        documentFontsStore.load([{provider: 'google', family: 'Lato'}]);
        try {
            await printResume({...source(PageSize.Letter), fonts: [{provider: 'builtin', family: 'Open Sans'}]});
            const html = (popup.document.write as jest.Mock).mock.calls.at(-1)[0] as string;
            expect(html).toContain('@font-face');
            expect(html).toContain('Open Sans');
            expect(html).not.toContain('fonts.googleapis.com');
            expect(html).not.toContain('Lato');
        } finally {open.mockRestore();}
    });

    test('HTML packaging includes the source font assets and license rather than active fonts', async () => {
        documentFontsStore.load([{provider: 'google', family: 'Lato'}]);
        global.fetch = jest.fn(async (url) => {
            if (String(url).includes('google')) throw new Error('Unexpected active font request');
            return {ok: true, headers: new Headers({'content-type': 'font/woff2'}),
                arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
                text: async () => 'Synthetic source font license'} as Response;
        });
        await exportResumeAsHtml({...source(PageSize.Letter), fonts: [{provider: 'builtin', family: 'Open Sans'}]});
        const text = await blobText(save.mock.calls[0][0] as Blob);
        expect(text).toContain('Open Sans');
        expect(text).toContain('fonts/licenses/open-sans.txt');
        expect(text).toContain('Synthetic source font license');
        expect(text).not.toContain('Lato');
    });

    test.each([[], undefined])('an empty or legacy source font manifest cannot borrow active fonts: %p', async fonts => {
        documentFontsStore.load([{provider: 'google', family: 'Lato'}]);
        await exportResumeAsHtml({...source(PageSize.Letter), fonts});
        const text = await blobText(save.mock.calls[0][0] as Blob);
        expect(text).not.toContain('Lato');
        expect(fetch).not.toHaveBeenCalled();
    });

    test('reports a blocked popup without mounting a document', async () => {
        const open = jest.spyOn(window, 'open').mockReturnValue(null);
        try {await expect(printResume(source(PageSize.Letter))).rejects.toThrow('print preview was blocked');}
        finally {open.mockRestore();}
        expect(document.querySelector('iframe')).toBeNull();
    });
});

function source(pageSize: PageSize) {
    return {nodes: [{type: 'PageBreak', uuid: 'print-page-break'}],
        stylesheet: 'body {font-size: 10pt; padding: 0; margin: 0;}', pageSize, ariaLabel: 'Resume'};
}

function printWindow(): Window {
    return {closed: false, document: {open: jest.fn(), write: jest.fn(), close: jest.fn(),
        fonts: {ready: Promise.resolve()}, images: [], querySelectorAll: () => [],
        defaultView: {requestAnimationFrame: (callback: FrameRequestCallback) => {callback(0); return 1;}}}, focus: jest.fn(), print: jest.fn(),
        requestAnimationFrame: (callback: FrameRequestCallback) => {callback(0); return 1;}
    } as unknown as Window;
}
