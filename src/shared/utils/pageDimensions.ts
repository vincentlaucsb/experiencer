import PageSize from '@/types/PageSize';

/** Converts the active paper width into the corresponding CSS page height. */
export function getPageHeightPixels(pageWidthPixels: number, pageSize: PageSize): number {
    if (pageSize === PageSize.A4) {
        return pageWidthPixels * (297 / 210);
    }

    return pageWidthPixels * (11 / 8.5);
}

/** Returns the number of physical pages occupied by the measured canvas. */
export function getPageCount(contentHeightPixels: number, pageHeightPixels: number): number {
    if (!Number.isFinite(contentHeightPixels) || !Number.isFinite(pageHeightPixels) || pageHeightPixels <= 0) {
        return 1;
    }

    return Math.max(1, Math.ceil(contentHeightPixels / pageHeightPixels));
}

export type NaturalPageBoundary = {
    type: 'natural';
    offset: number;
};

export type UserPageBoundary = {
    type: 'user';
    offset: number;
    /** Leftover space before the break; the editor applies this as break height. */
    marginTop: number;
};

export type PageBoundary = NaturalPageBoundary | UserPageBoundary;

/** Fills an explicit break to the next physical boundary, including a full page at a boundary. */
export function calculatePageBreakFiller(offset: number, pageHeight: number): number {
    if (!Number.isFinite(offset)
        || !Number.isFinite(pageHeight) || pageHeight <= 0) {
        throw new Error('Page measurements must be finite and page height must be positive.');
    }

    const remainder = ((offset % pageHeight) + pageHeight) % pageHeight;
    return pageHeight - remainder;
}

/**
 * Maps unpadded content geometry onto editor page guides.
 * Offsets are in document order. Returned positions include earlier fillers so
 * a user break lands on a page edge and later naturals stay aligned after it.
 */
export function calculatePageBoundaries(
    pageHeight: number,
    contentHeight: number,
    userBreakOffsets: readonly number[] = []
): PageBoundary[] {
    if (!Number.isFinite(pageHeight) || pageHeight <= 0
        || !Number.isFinite(contentHeight) || contentHeight < 0) {
        throw new Error('Page measurements must be finite and page height must be positive.');
    }

    const boundaries: PageBoundary[] = [];
    let cursor = 0;
    let accumulatedFiller = 0;

    const emitNaturals = (segmentStart: number, segmentHeight: number) => {
        for (let consumed = pageHeight; consumed < segmentHeight; consumed += pageHeight) {
            boundaries.push({
                type: 'natural',
                offset: segmentStart + consumed + accumulatedFiller
            });
        }
    };

    for (const breakOffset of userBreakOffsets) {
        if (!Number.isFinite(breakOffset) || breakOffset < cursor) {
            continue;
        }

        const segmentHeight = breakOffset - cursor;
        emitNaturals(cursor, segmentHeight);

        const marginTop = calculatePageBreakFiller(segmentHeight, pageHeight);
        boundaries.push({
            type: 'user',
            offset: breakOffset + accumulatedFiller,
            marginTop
        });

        accumulatedFiller += marginTop;
        cursor = breakOffset;
    }

    emitNaturals(cursor, Math.max(0, contentHeight - cursor));
    return boundaries;
}
