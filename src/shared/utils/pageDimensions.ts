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
