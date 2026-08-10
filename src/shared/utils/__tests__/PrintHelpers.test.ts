import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import { documentFontsStore } from '@/shared/stores/documentFontsStore';
import { useEditorStore } from '@/shared/stores/editorStore';
import { buildHtmlExportPackage } from '@/shared/utils/HtmlExportPackage';
import { exportResumeAsHtml, printResume } from '@/shared/utils/PrintHelpers';
import { workspaceStore } from '@/shared/stores/workspaceStore';
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
        workspaceStore.openDocument('resume-1');
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
            expect.stringContaining(`@page { size: ${pageSizeLabel}; margin: 0; }\n${stylesheet}`),
            resumeElement.outerHTML
        );
        expect(buildPackageMock).toHaveBeenCalledWith(expect.objectContaining({
            stylesheet: expect.stringContaining(`@page { size: ${pageSizeLabel}; margin: 0; }`),
            resumeHtml: resumeElement.outerHTML
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
        expect(workspaceStore.getSnapshot().mode).toBe('normal');
        openSpy.mockRestore();
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
