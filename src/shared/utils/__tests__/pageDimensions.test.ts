import PageSize from '@/types/PageSize';
import { getPageCount, getPageHeightPixels } from '@/shared/utils/pageDimensions';

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
