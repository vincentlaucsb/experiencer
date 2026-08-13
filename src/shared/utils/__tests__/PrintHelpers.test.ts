import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import { useEditorStore } from '@/shared/stores/editorStore';
import { buildHtmlExportPackage } from '@/shared/utils/HtmlExportPackage';
import {
    createPrintableResumeHtml,
    exportResumeAsHtml,
    printResume
} from '@/shared/utils/PrintHelpers';
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
    const stylesheet = '#resume { font-size: 10pt; }';
    let requestAnimationFrameSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        requestAnimationFrameSpy = jest
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((callback: FrameRequestCallback) => {
                callback(0);
                return 1;
            });
        useEditorStore.setState({ pageSize: PageSize.Letter });
        documentFontsStore.load(undefined);
    });

    afterEach(() => {
        requestAnimationFrameSpy.mockRestore();
    });

    test.each([
        [PageSize.A4, 'A4'],
        [PageSize.Letter, 'Letter']
    ])('packages a %s resume with its page rule', async (pageSize, pageSizeLabel) => {
        useEditorStore.setState({ pageSize });
        const resumeElement = createResumeElement();

        await exportResumeAsHtml(resumeElement, stylesheet, 'resume.html');

        expect(generateHtmlMock).toHaveBeenCalledWith(
            expect.stringContaining(`@page { size: ${pageSizeLabel}; margin: 0; }`),
            resumeElement.innerHTML
        );
        expect(generateHtmlMock).toHaveBeenCalledWith(
            expect.stringContaining('body { font-size: 10pt; }'),
            resumeElement.innerHTML
        );
        expect(buildPackageMock).toHaveBeenCalledWith(expect.objectContaining({
            stylesheet: expect.stringContaining(`@page { size: ${pageSizeLabel}; margin: 0; }`),
            resumeHtml: resumeElement.innerHTML
        }));
        expect(buildPackageMock).toHaveBeenCalledWith(expect.objectContaining({
            stylesheet: expect.stringContaining('body { min-height: 0 !important; }')
        }));
        expect(saveAsMock).toHaveBeenCalledWith(expect.any(Blob), 'resume.zip');
    });

    test('prints from a new resume-only window after fonts and layout settle', async () => {
        const printWindow = createPrintWindow();
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(printWindow);

        await printResume(createResumeElement(), stylesheet);

        expect(openSpy).toHaveBeenCalledWith('', '_blank');
        expect(printWindow.document.write).toHaveBeenLastCalledWith(
            '<html><body><main id="resume"></main></body></html>'
        );
        expect(printWindow.focus).toHaveBeenCalled();
        expect(printWindow.print).toHaveBeenCalled();
        openSpy.mockRestore();
    });

    test('removes editor-only nodes from the printable snapshot', () => {
        const resumeElement = createResumeElement();
        resumeElement.innerHTML = `
            <div class="resume-page-boundaries no-print"></div>
            <div class="page-break page-break-editing">
                <span class="page-break-label">Page Break</span>
            </div>
            <p>Resume</p>
        `;

        const html = createPrintableResumeHtml(resumeElement);

        expect(html).toContain('Resume');
        expect(html).not.toContain('resume-page-boundaries');
        expect(html).not.toContain('page-break-label');
        expect(html).not.toContain('page-break-editing');
        expect(html).toContain('class="page-break"');
        expect(html).not.toContain('id="resume"');
    });

    test('maps legacy editor container CSS to the standalone body', async () => {
        await exportResumeAsHtml(createResumeElement(), stylesheet);

        expect(generateHtmlMock).toHaveBeenCalledWith(
            expect.stringContaining('body { font-size: 10pt; }'),
            expect.any(String)
        );
    });

    test('reports a blocked print-preview window', async () => {
        const openSpy = jest.spyOn(window, 'open').mockReturnValue(null);

        await expect(printResume(createResumeElement(), stylesheet))
            .rejects.toThrow('print preview was blocked');

        openSpy.mockRestore();
    });
});

function createResumeElement() {
    const resumeElement = document.createElement('main');
    resumeElement.id = 'resume';
    resumeElement.innerHTML = '<p>Resume</p>';
    return resumeElement;
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
