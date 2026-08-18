import * as React from 'react';

import { observePageBoundaries } from '@/shared/utils/pageBoundaries';
import PageSize from '@/types/PageSize';

interface ResumePageBoundariesProps {
    pageSize: PageSize;
}

/** Shows overflow page guides. Explicit breaks receive leftover-space padding in the observer. */
export default function PageBoundaries(props: ResumePageBoundariesProps) {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const [naturalOffsets, setNaturalOffsets] = React.useState<number[]>([]);
    const [pageHeightPixels, setPageHeightPixels] = React.useState(0);

    React.useLayoutEffect(() => {
        const resume = hostRef.current?.closest('#resume');
        if (!(resume instanceof HTMLElement)) return;

        return observePageBoundaries(resume, props.pageSize, (measurement) => {
            setPageHeightPixels(measurement.pageHeightPixels);
            setNaturalOffsets(
                measurement.boundaries
                    .filter((boundary) => boundary.type === 'natural')
                    .map((boundary) => boundary.offset)
            );
        });
    }, [props.pageSize]);

    const pageCount = naturalOffsets.length === 0 || pageHeightPixels <= 0
        ? 1
        : Math.round(naturalOffsets[naturalOffsets.length - 1] / pageHeightPixels) + 1;

    return (
        <div
            ref={hostRef}
            className="resume-page-boundaries no-print"
            role="status"
            aria-live="polite"
            aria-label={pageCount > 1
                ? `Content continues onto ${pageCount} pages`
                : undefined}
        >
            {naturalOffsets.map((offset) => {
                const pageNumber = Math.round(offset / pageHeightPixels) + 1;
                return (
                    <div
                        className="resume-page-boundary"
                        key={pageNumber}
                        style={{ top: `${offset}px` }}
                    >
                        <span className="resume-page-boundary-label">
                            {pageNumber === 2
                                ? 'Content continues onto page 2'
                                : `Page ${pageNumber} begins`}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
