import { saveAs } from 'file-saver';
import generateHtml from '@/editor/GenerateHtml';
import { useEditorStore } from '@/shared/stores/editorStore';
import { exportResumeAsHtml } from '@/shared/utils/PrintHelpers';
import PageSize from '@/types/PageSize';

jest.mock('file-saver', () => ({
    saveAs: jest.fn()
}));

jest.mock('@/editor/GenerateHtml', () => ({
    __esModule: true,
    default: jest.fn(() => '<html></html>')
}));

describe('exportResumeAsHtml', () => {
    const saveAsMock = saveAs as jest.MockedFunction<typeof saveAs>;
    const generateHtmlMock = generateHtml as jest.MockedFunction<typeof generateHtml>;
    const stylesheet = '#resume { font-size: 10pt; }';

    const mockImmediateRequestAnimationFrame = () => {
        return jest
            .spyOn(window, 'requestAnimationFrame')
            .mockImplementation((cb: FrameRequestCallback) => {
                cb(0);
                return 1;
            });
    };

    const createResumeElement = () => {
        const resumeElement = document.createElement('div');
        resumeElement.id = 'resume';
        resumeElement.innerHTML = '<p>Resume</p>';
        return resumeElement;
    };

    const expectExportCalledWithPageSize = (pageSizeLabel: 'A4' | 'Letter', resumeHtml: string) => {
        expect(generateHtmlMock).toHaveBeenCalledWith(
            expect.stringContaining(`@page { size: ${pageSizeLabel}; }\n${stylesheet}`),
            resumeHtml
        );
        expect(saveAsMock).toHaveBeenCalledTimes(1);
    };

    beforeEach(() => {
        jest.clearAllMocks();

        useEditorStore.setState({
            mode: 'normal',
            pageSize: PageSize.Letter
        });
    });

    test('injects A4 @page rule into exported stylesheet when page size is a4', () => {
        useEditorStore.setState({ pageSize: PageSize.A4 });
        const requestAnimationFrameSpy = mockImmediateRequestAnimationFrame();
        const resumeElement = createResumeElement();

        exportResumeAsHtml(resumeElement, stylesheet, 'resume.html');
        expectExportCalledWithPageSize('A4', resumeElement.outerHTML);

        requestAnimationFrameSpy.mockRestore();
    });

    test('injects Letter @page rule into exported stylesheet when page size is letter', () => {
        useEditorStore.setState({ pageSize: PageSize.Letter });
        const requestAnimationFrameSpy = mockImmediateRequestAnimationFrame();
        const resumeElement = createResumeElement();

        exportResumeAsHtml(resumeElement, stylesheet, 'resume.html');
        expectExportCalledWithPageSize('Letter', resumeElement.outerHTML);

        requestAnimationFrameSpy.mockRestore();
    });
});
