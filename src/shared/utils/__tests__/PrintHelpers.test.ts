import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import registerNodes from '@/resume/schema';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import { buildHtmlExportPackage } from '@/shared/utils/HtmlExportPackage';
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';
import PageSize from '@/types/PageSize';

jest.mock('file-saver', () => ({
    saveAs: jest.fn()
}));

jest.mock('@/editor/GenerateHtml', () => ({
    __esModule: true,
    default: jest.fn(() => '<html><body><main id="resume"></main></body></html>')
}));

jest.mock('@/shared/utils/HtmlExportPackage', () => ({
    buildHtmlExportPackage: jest.fn(async () => new Blob(['zip'], { type: 'application/zip' }))
}));

describe('resume printing and HTML export', () => {
    const saveAsMock = saveAs as jest.MockedFunction<typeof saveAs>;
    const generateHtmlMock = generateHtml as jest.MockedFunction<typeof generateHtml>;
    const buildPackageMock = buildHtmlExportPackage as jest.MockedFunction<typeof buildHtmlExportPackage>;
    const stylesheet = 'body { font-size: 10pt; }';
    let requestAnimationFrameSpy: jest.SpyInstance;

    beforeAll(() => {
        registerNodes();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        requestAnimationFrameSpy = jest
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((callback: FrameRequestCallback) => {
                callback(0);
                return 1;
            });
        documentFontsStore.load(undefined);
    });

    afterEach(() => {
        requestAnimationFrameSpy.mockRestore();
    });

    test.each([
        [PageSize.A4, 'A4'],
        [PageSize.Letter, 'Letter']
    ])('packages a %s resume with its page rule', async (pageSize, pageSizeLabel) => {
        const source = createSource(pageSize);
        await exportResumeAsHtml(source, 'resume.html');

        expect(generateHtmlMock).toHaveBeenCalledWith(
            expect.stringContaining(`@page { size: ${pageSizeLabel}; margin: 0; }`),
            '<div class="page-break" data-uuid="print-page-break"></div>'
        );
        expect(generateHtmlMock).toHaveBeenCalledWith(
            expect.stringContaining('body { font-size: 10pt; }'),
            '<div class="page-break" data-uuid="print-page-break"></div>'
        );
        expect(buildPackageMock).toHaveBeenCalledWith(expect.objectContaining({
            stylesheet: expect.stringContaining(`@page { size: ${pageSizeLabel}; margin: 0; }`),
            resumeHtml: '<div class="page-break" data-uuid="print-page-break"></div>'
        }));
        expect(buildPackageMock).toHaveBeenCalledWith(expect.objectContaining({
            resumeHtml: expect.not.stringContaining('Page Break')
        }));
        expect(buildPackageMock).toHaveBeenCalledWith(expect.objectContaining({
            stylesheet: expect.stringContaining('body { min-height: 0 !important; }')
        }));
        expect(saveAsMock).toHaveBeenCalledWith(expect.any(Blob), 'resume.zip');
    });

    test('prints from a new resume-only window after fonts and layout settle', async () => {
        const printWindow = createPrintWindow();
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(printWindow);

        await printResume(createSource(PageSize.Letter));

        expect(openSpy).toHaveBeenCalledWith('', '_blank');
        expect(printWindow.document.write).toHaveBeenLastCalledWith(
            '<html><body><main id="resume"></main></body></html>'
        );
        expect(printWindow.focus).toHaveBeenCalled();
        expect(printWindow.print).toHaveBeenCalled();
        openSpy.mockRestore();
    });

    test('reports a blocked print-preview window', async () => {
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

        await expect(printResume(createSource(PageSize.Letter)))
            .rejects.toThrow('print preview was blocked');

        openSpy.mockRestore();
    });
});

function createSource(pageSize: PageSize) {
    return {
        nodes: [{ type: 'PageBreak', uuid: 'print-page-break' }],
        stylesheet: 'body { font-size: 10pt; }',
        pageSize,
        ariaLabel: 'Resume'
    };
}

function createPrintWindow(): Window {
    const printDocument = {
        open: jest.fn(),
        write: jest.fn(),
        close: jest.fn(),
        fonts: { ready: Promise.resolve() },
        images: []
    };
    return {
        closed: false,
        document: printDocument,
        focus: jest.fn(),
        print: jest.fn(),
        requestAnimationFrame: (callback: FrameRequestCallback) => {
            callback(0);
            return 1;
        }
    } as unknown as Window;
}
