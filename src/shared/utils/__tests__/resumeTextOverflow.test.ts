import PageSize from '@/types/PageSize';
import { ResumeOutputController } from '@/shared/services/ResumeOutputController';
import { resumeTextOverflowStore } from '@/shared/stores/resumeTextOverflowStore';
import { measureResumeTextOverflow, observeResumeTextOverflow } from '../resumeTextOverflow';

const id = '10000000-0000-0000-0000-000000000001';
let right = 900;
const rect = (left: number, right: number) => ({ left, right, top: 20, bottom: 40, width: right - left, height: 20 } as DOMRect);
let previousRects: PropertyDescriptor | undefined;

beforeEach(() => {
    document.body.innerHTML = `<div id="paper"><div class="column" style="padding:10px"><span data-uuid="${id}">Private applicant text</span></div></div>`;
    const root = document.getElementById('paper')!;
    jest.spyOn(root, 'getBoundingClientRect').mockReturnValue(rect(0, 816));
    const column = root.firstElementChild as HTMLElement;
    jest.spyOn(column, 'getBoundingClientRect').mockReturnValue(rect(400, 600));
    Object.defineProperty(column, 'offsetWidth', { configurable: true, value: 200 });
    previousRects = Object.getOwnPropertyDescriptor(Range.prototype, 'getClientRects');
    Object.defineProperty(Range.prototype, 'getClientRects', { configurable: true, value: () => [rect(410, right)] });
    right = 900;
});
afterEach(() => {
    jest.restoreAllMocks();
    if (previousRects) Object.defineProperty(Range.prototype, 'getClientRects', previousRects);
    else delete (Range.prototype as Partial<Range>).getClientRects;
    document.body.replaceChildren();
});

test('reports painted text escaping both the column and paper without retaining private text', () => {
    const result = measureResumeTextOverflow(document.getElementById('paper')!, 1056);
    expect(result.count).toBe(2);
    expect(result.findings).toEqual(expect.arrayContaining([
        { nodeId: id, page: 1, boundary: 'page', leftPixels: 0, rightPixels: 84 },
        { nodeId: id, page: 1, boundary: 'column', leftPixels: 0, rightPixels: 310 }
    ]));
    expect(JSON.stringify(result)).not.toContain('Private applicant');
});

test('ordinary text and hidden/editor-only content do not produce warnings', () => {
    const root = document.getElementById('paper')!;
    right = 580;
    expect(measureResumeTextOverflow(root, 1056).count).toBe(0);
    right = 900;
    (root.querySelector('span') as HTMLElement).style.visibility = 'hidden';
    expect(measureResumeTextOverflow(root, 1056).count).toBe(0);
    (root.querySelector('span') as HTMLElement).style.visibility = '';
    (root.querySelector('span') as HTMLElement).style.color = 'transparent';
    expect(measureResumeTextOverflow(root, 1056).count).toBe(0);
    (root.querySelector('span') as HTMLElement).style.color = '';
    root.querySelector('span')!.classList.add('no-print');
    expect(measureResumeTextOverflow(root, 1056).count).toBe(0);
});

test('reports clipped text and bounds the number of retained geometry findings', () => {
    const root = document.getElementById('paper')!;
    (root.firstElementChild as HTMLElement).style.overflowX = 'hidden';
    expect(measureResumeTextOverflow(root, 1056).findings.some(f => f.boundary === 'clipped')).toBe(true);
    root.firstElementChild!.innerHTML = Array.from({ length: 30 }, (_, index) =>
        `<span data-uuid="10000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}">private</span>`).join('');
    const result = measureResumeTextOverflow(root, 1056);
    expect(result.count).toBe(60);
    expect(result.findings).toHaveLength(20);
    expect(result.truncated).toBe(true);
});

test('unavailable geometry is empty and observer cleanup cancels scheduled work', () => {
    const root = document.createElement('div');
    expect(measureResumeTextOverflow(root, 1056).count).toBe(0);
    const request = jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const dispose = observeResumeTextOverflow(root, () => 1056, () => { throw new Error('Disposed work must not publish'); });
    expect(request).toHaveBeenCalledTimes(1);
    dispose();
    expect(cancel).toHaveBeenCalledWith(42);
});


test('print measures current geometry before an observer animation frame has run', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const print = jest.fn(async () => {});
    const controller = new ResumeOutputController({ print, exportHtml: async () => {}, startPng() {}, showError() {},
        hasTextOverflow: () => resumeTextOverflowStore.measureCurrent().count > 0 });
    const leave = controller.bindEditor(document.getElementById('paper')!, PageSize.Letter);
    expect(resumeTextOverflowStore.getSnapshot().count).toBe(0);
    controller.print({ nodes: [], stylesheet: '', pageSize: PageSize.Letter, ariaLabel: 'Synthetic' });
    expect(controller.getPrintReviewSnapshot()).toBe(true);
    expect(print).not.toHaveBeenCalled();
    leave();
});
