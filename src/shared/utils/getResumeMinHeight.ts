import PageSize from '@/types/PageSize';
import { ResumeNode } from '@/types';

/** Runtime node type used to identify explicit page breaks in the root resume list. */
const PAGE_BREAK_TYPE = 'PageBreak';

/**
 * Compute the minimum visual height for the resume canvas based on page size and
 * top-level page break markers.
 *
 * Formula: minPages = pageBreakCount + 1
 * - Letter: 11in per page
 * - A4: 297mm per page
 *
 * The result is a CSS length string intended for use as an inline `min-height`.
 * Content can still exceed this minimum naturally.
 *
 * @param resumeNodes Root-level resume nodes in display order.
 * @param pageSize Active page size mode (Letter or A4).
 * @returns CSS `min-height` value (for example `22in` or `891mm`).
 */
export default function getResumeMinHeight(resumeNodes: ResumeNode[], pageSize: PageSize): string {
    const pageBreakCount = resumeNodes.filter((node) => node.type === PAGE_BREAK_TYPE).length;
    const minPageCount = pageBreakCount + 1;

    if (pageSize === PageSize.A4) {
        return `${297 * minPageCount}mm`;
    }

    return `${11 * minPageCount}in`;
}