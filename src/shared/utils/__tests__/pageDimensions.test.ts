import PageSize from '@/types/PageSize';
import {
    calculatePageBoundaries,
    calculatePageBreakFiller,
    getPageCount,
    getPageHeightPixels
} from '@/shared/utils/pageDimensions';

const PAGE = 1056;

test.each([
    [PageSize.Letter, 816, 1056],
    [PageSize.A4, 793.7, 1122.52]
])('calculates the %s page height from the rendered width', (pageSize, width, expectedHeight) => {
    expect(getPageHeightPixels(width, pageSize)).toBeCloseTo(expectedHeight, 1);
});

test('detects content that continues onto another page', () => {
    expect(getPageCount(1056, 1056)).toBe(1);
    expect(getPageCount(1057, 1056)).toBe(2);
    expect(getPageCount(2500, 1056)).toBe(3);
});

test('fills an explicit break to the next boundary', () => {
    expect(calculatePageBreakFiller(500, PAGE)).toBe(556);
    expect(calculatePageBreakFiller(PAGE, PAGE)).toBe(PAGE);
});

test('rejects invalid page measurements', () => {
    expect(() => calculatePageBreakFiller(Number.NaN, PAGE)).toThrow();
    expect(() => calculatePageBoundaries(0, 100)).toThrow();
    expect(() => calculatePageBoundaries(PAGE, Number.NaN)).toThrow();
});

test('draws no guides when content fits on one page', () => {
    expect(calculatePageBoundaries(PAGE, 400)).toEqual([]);
    expect(calculatePageBoundaries(PAGE, PAGE)).toEqual([]);
});

test('draws a natural border for each overflowing page without a user break', () => {
    expect(calculatePageBoundaries(PAGE, 1057)).toEqual([
        { type: 'natural', offset: PAGE }
    ]);
    expect(calculatePageBoundaries(PAGE, 2500)).toEqual([
        { type: 'natural', offset: PAGE },
        { type: 'natural', offset: PAGE * 2 }
    ]);
});

test('pads a short segment so the user break sits on the next page edge', () => {
    expect(calculatePageBoundaries(PAGE, 400, [300])).toEqual([
        { type: 'user', offset: 300, marginTop: 756 }
    ]);
});

test('inserts natural borders before a user break that follows overflow', () => {
    expect(calculatePageBoundaries(PAGE, 2200, [2000])).toEqual([
        { type: 'natural', offset: PAGE },
        { type: 'user', offset: 2000, marginTop: 112 }
    ]);
});

test('keeps later naturals aligned after earlier fillers', () => {
    expect(calculatePageBoundaries(PAGE, 2500, [300])).toEqual([
        { type: 'user', offset: 300, marginTop: 756 },
        { type: 'natural', offset: 300 + PAGE + 756 },
        { type: 'natural', offset: 300 + PAGE * 2 + 756 }
    ]);
});

test('treats a break on a page boundary as a full extra page of leftover space', () => {
    expect(calculatePageBoundaries(PAGE, PAGE, [PAGE])).toEqual([
        { type: 'user', offset: PAGE, marginTop: PAGE }
    ]);
});

test('pads consecutive user breaks independently', () => {
    expect(calculatePageBoundaries(PAGE, 600, [300, 500])).toEqual([
        { type: 'user', offset: 300, marginTop: 756 },
        { type: 'user', offset: 500 + 756, marginTop: 856 }
    ]);
});
