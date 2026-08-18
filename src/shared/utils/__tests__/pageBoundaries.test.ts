import PageSize from '@/types/PageSize';
import {
    applyPageBreakFillers,
    measurePageBoundaries,
    observePageBoundaries,
    syncPageBoundaries
} from '@/shared/utils/pageBoundaries';

const PAGE = 1056;

type Box = {
    top: number;
    height: number;
    width?: number;
};

function mockBox(element: HTMLElement, box: Box) {
    const width = box.width ?? 816;
    Object.defineProperty(element, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({
            x: 0,
            y: box.top,
            top: box.top,
            left: 0,
            right: width,
            bottom: box.top + box.height,
            width,
            height: box.height,
            toJSON: () => undefined
        })
    });
}

function createResume(children: Array<{ className: string; top: number; height: number; filler?: number }>) {
    const resume = document.createElement('div');
    mockBox(resume, { top: 0, height: PAGE, width: 816 });

    for (const child of children) {
        const element = document.createElement('div');
        element.className = child.className;
        if (child.filler !== undefined) {
            element.style.setProperty('--page-break-filler', `${child.filler}px`);
        }
        mockBox(element, { top: child.top, height: child.height });
        resume.appendChild(element);
    }

    return resume;
}

test('does not treat stretch-absorbing auto margins as leftover content', () => {
    const resume = createResume([
        { className: 'column', top: 0, height: PAGE * 2 }
    ]);
    const content = document.createElement('div');
    content.className = 'section';
    mockBox(content, { top: 0, height: 400 });
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.style.marginTop = '800px';
    mockBox(footer, { top: 1200, height: 50 });
    resume.children[0].appendChild(content);
    resume.children[0].appendChild(footer);

    expect(measurePageBoundaries(resume, PageSize.Letter).contentHeightPixels).toBe(450);
});

test('ignores stretched grid columns and measures descendant content instead', () => {
    const resume = createResume([
        { className: 'column', top: 0, height: PAGE * 2 }
    ]);
    const section = document.createElement('div');
    section.className = 'section';
    mockBox(section, { top: 0, height: 400 });
    resume.children[0].appendChild(section);

    expect(measurePageBoundaries(resume, PageSize.Letter)).toEqual({
        pageHeightPixels: PAGE,
        contentHeightPixels: 400,
        boundaries: []
    });
});

test('measures leftover space from content boxes instead of canvas min-height', () => {
    const resume = createResume([
        { className: 'section', top: 0, height: 400 }
    ]);
    Object.defineProperty(resume, 'scrollHeight', { configurable: true, value: PAGE * 2 });

    expect(measurePageBoundaries(resume, PageSize.Letter)).toEqual({
        pageHeightPixels: PAGE,
        contentHeightPixels: 400,
        boundaries: []
    });
});

test('subtracts earlier fillers when measuring later breaks', () => {
    const resume = createResume([
        { className: 'section', top: 0, height: 300 },
        { className: 'page-break', top: 300, height: 756, filler: 756 },
        { className: 'section', top: 1056, height: 200 },
        { className: 'page-break', top: 1256, height: 0 }
    ]);

    expect(measurePageBoundaries(resume, PageSize.Letter)).toEqual({
        pageHeightPixels: PAGE,
        contentHeightPixels: 500,
        boundaries: [
            { type: 'user', offset: 300, marginTop: 756 },
            { type: 'user', offset: 1256, marginTop: 856 }
        ]
    });
});

test('derives unpadded break offsets from the current filler height', () => {
    const resume = createResume([
        { className: 'section', top: 0, height: 300 },
        { className: 'page-break', top: 300, height: 756, filler: 756 },
        { className: 'section', top: 1056, height: 200 }
    ]);

    expect(measurePageBoundaries(resume, PageSize.Letter)).toEqual({
        pageHeightPixels: PAGE,
        contentHeightPixels: 500,
        boundaries: [
            { type: 'user', offset: 300, marginTop: 756 }
        ]
    });
});

test('uses preceding in-flow content when a page break has not been laid out', () => {
    const resume = createResume([
        { className: 'column', top: 0, height: 989 },
        { className: 'page-break', top: 1, height: 0 }
    ]);

    expect(measurePageBoundaries(resume, PageSize.Letter)).toEqual({
        pageHeightPixels: PAGE,
        contentHeightPixels: 989,
        boundaries: [
            { type: 'user', offset: 989, marginTop: 67 }
        ]
    });
});

test('syncs leftover space onto explicit page breaks', () => {
    const resume = createResume([
        { className: 'section', top: 0, height: 300 },
        { className: 'page-break', top: 300, height: 0 },
        { className: 'section', top: 300, height: 200 }
    ]);

    const measurement = syncPageBoundaries(resume, PageSize.Letter);
    const pageBreak = resume.querySelector<HTMLElement>('.page-break');

    expect(measurement.boundaries).toEqual([
        { type: 'user', offset: 300, marginTop: 756 }
    ]);
    expect(pageBreak?.style.getPropertyValue('--page-break-filler')).toBe('756px');
});

test('applies fillers in document order', () => {
    const resume = createResume([
        { className: 'page-break', top: 300, height: 0 },
        { className: 'page-break', top: 500, height: 0 }
    ]);

    applyPageBreakFillers(resume, [
        { type: 'user', offset: 300, marginTop: 756 },
        { type: 'user', offset: 1256, marginTop: 856 }
    ]);

    const breaks = resume.querySelectorAll<HTMLElement>('.page-break');
    expect(breaks[0].style.getPropertyValue('--page-break-filler')).toBe('756px');
    expect(breaks[1].style.getPropertyValue('--page-break-filler')).toBe('856px');
});

test('notifies only when the measured page geometry changes', () => {
    const resume = createResume([
        { className: 'section', top: 0, height: 400 }
    ]);
    const onChange = jest.fn();
    const requestFrame = jest.spyOn(window, 'requestAnimationFrame')
        .mockImplementation((callback) => {
            callback(0);
            return 1;
        });
    const stopObserving = observePageBoundaries(resume, PageSize.Letter, onChange);

    try {
        expect(onChange).toHaveBeenCalledTimes(1);
        window.dispatchEvent(new Event('resize'));
        expect(onChange).toHaveBeenCalledTimes(1);

        mockBox(resume.children[0] as HTMLElement, { top: 0, height: 2500 });
        window.dispatchEvent(new Event('resize'));
        expect(onChange).toHaveBeenCalledTimes(2);
        expect(onChange).toHaveBeenLastCalledWith({
            pageHeightPixels: PAGE,
            contentHeightPixels: 2500,
            boundaries: [
                { type: 'natural', offset: PAGE },
                { type: 'natural', offset: PAGE * 2 }
            ]
        });
    } finally {
        stopObserving();
        requestFrame.mockRestore();
    }
});
