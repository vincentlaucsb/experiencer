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


test('overflow review can cancel or continue exactly one print without changing the source', () => {
    const outputPorts = { ...ports(), hasTextOverflow: () => true };
    const controller = new ResumeOutputController(outputPorts);
    const snapshots: boolean[] = [];
    const dispose = controller.subscribePrintReview(() => snapshots.push(controller.getPrintReviewSnapshot()));
    controller.print(source);
    expect(controller.getPrintReviewSnapshot()).toBe(true);
    expect(outputPorts.print).not.toHaveBeenCalled();
    controller.cancelPrintReview();
    expect(controller.getPrintReviewSnapshot()).toBe(false);
    expect(outputPorts.print).not.toHaveBeenCalled();
    controller.print(source);
    controller.continuePrint();
    controller.continuePrint();
    expect(outputPorts.print).toHaveBeenCalledTimes(1);
    expect(outputPorts.print).toHaveBeenCalledWith(source);
    expect(snapshots.slice(0, 4)).toEqual([true, false, true, false]);
    dispose();
});


test('leaving the editor cancels its retained print request before another editor can mount', () => {
    const outputPorts = { ...ports(), hasTextOverflow: () => true };
    const controller = new ResumeOutputController(outputPorts);
    const leave = controller.bindEditor(document.createElement('div'), PageSize.Letter);
    controller.print(source);
    expect(controller.getPrintReviewSnapshot()).toBe(true);
    leave();
    const leaveNext = controller.bindEditor(document.createElement('div'), PageSize.A4);
    expect(controller.getPrintReviewSnapshot()).toBe(false);
    controller.continuePrint();
    expect(outputPorts.print).not.toHaveBeenCalled();
    leaveNext();
});
