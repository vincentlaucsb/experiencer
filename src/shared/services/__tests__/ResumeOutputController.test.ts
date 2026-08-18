import { ResumeOutputController } from '@/shared/services/ResumeOutputController';
import type { ResumeDocumentSource } from '@/shared/resumeDocument/prepareResumeDocument';
import PageSize from '@/types/PageSize';

const source: ResumeDocumentSource = {
    nodes: [],
    stylesheet: '',
    pageSize: PageSize.Letter,
    ariaLabel: 'Resume'
};

function ports() {
    return {
        exportHtml: jest.fn(async () => undefined),
        print: jest.fn(async () => undefined),
        startPng: jest.fn(),
        showError: jest.fn()
    };
}

test('routes HTML, print, and PNG commands through the output ports', async () => {
    const outputPorts = ports();
    const controller = new ResumeOutputController(outputPorts);

    controller.exportHtml(source);
    controller.print(source);
    controller.exportPng(source);

    await Promise.resolve();
    expect(outputPorts.exportHtml).toHaveBeenCalledWith(source, 'resume.zip');
    expect(outputPorts.print).toHaveBeenCalledWith(source);
    expect(outputPorts.startPng).toHaveBeenCalledWith(source);
    expect(outputPorts.showError).not.toHaveBeenCalled();
});

test('reports HTML and print failures without throwing', async () => {
    const outputPorts = ports();
    outputPorts.exportHtml.mockRejectedValueOnce(new Error('export failed'));
    outputPorts.print.mockRejectedValueOnce(new Error('print failed'));
    const controller = new ResumeOutputController(outputPorts);

    controller.exportHtml(source);
    controller.print(source);
    await Promise.resolve();
    await Promise.resolve();

    expect(outputPorts.showError).toHaveBeenCalledWith('export failed');
    expect(outputPorts.showError).toHaveBeenCalledWith('print failed');
});
