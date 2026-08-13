import * as React from 'react';

import PageSize from '@/types/PageSize';
import { getPageCount, getPageHeightPixels } from '@/shared/utils/pageDimensions';

interface ResumePageBoundariesProps {
    pageSize: PageSize;
    resumeRef: React.RefObject<HTMLDivElement | null>;
}

interface PageMeasurement {
    pageCount: number;
    pageHeightPixels: number;
}

/** Shows physical page boundaries in the editor without affecting exported content. */
export default function PageBoundaries(props: ResumePageBoundariesProps) {
    const [measurement, setMeasurement] = React.useState<PageMeasurement>({
        pageCount: 1,
        pageHeightPixels: 0
    });

    React.useLayoutEffect(() => {
        const resume = props.resumeRef.current;
        if (!resume) return;

        let cancelled = false;
        let frame: number | undefined;

        const measure = () => {
            if (cancelled) return;

            const pageHeightPixels = getPageHeightPixels(
                resume.getBoundingClientRect().width,
                props.pageSize
            );
            const pageCount = getPageCount(resume.scrollHeight, pageHeightPixels);

            if (pageHeightPixels <= 0) return;

            setMeasurement((current) => (
                current.pageCount === pageCount
                && current.pageHeightPixels === pageHeightPixels
                    ? current
                    : { pageCount, pageHeightPixels }
            ));
        };

        const scheduleMeasure = () => {
            if (frame !== undefined) return;

            frame = window.requestAnimationFrame(() => {
                frame = undefined;
                measure();
            });
        };

        measure();
        window.addEventListener('resize', scheduleMeasure);

        const resizeObserver = typeof ResizeObserver === 'undefined'
            ? undefined
            : new ResizeObserver(scheduleMeasure);
        resizeObserver?.observe(resume);

        const mutationObserver = typeof MutationObserver === 'undefined'
            ? undefined
            : new MutationObserver(scheduleMeasure);
        mutationObserver?.observe(resume, {
            attributes: true,
            characterData: true,
            childList: true,
            subtree: true
        });

        const fontsReady = document.fonts?.ready;
        void fontsReady?.then(() => {
            if (!cancelled) scheduleMeasure();
        });

        return () => {
            cancelled = true;
            window.removeEventListener('resize', scheduleMeasure);
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            if (frame !== undefined) {
                window.cancelAnimationFrame(frame);
            }
        };
    }, [props.pageSize, props.resumeRef]);

    if (measurement.pageCount <= 1) return null;

    const pageBoundaries = Array.from({ length: measurement.pageCount - 1 }, (_, index) => {
        const pageNumber = index + 2;
        return (
            <div
                className="resume-page-boundary"
                key={pageNumber}
                style={{ top: `${measurement.pageHeightPixels * (index + 1)}px` }}
            >
                <span className="resume-page-boundary-label">
                    {pageNumber === 2
                        ? 'Content continues onto page 2'
                        : `Page ${pageNumber} begins`}
                </span>
            </div>
        );
    });

    return (
        <div
            className="resume-page-boundaries no-print"
            role="status"
            aria-live="polite"
            aria-label={`Content continues onto ${measurement.pageCount} pages`}
        >
            {pageBoundaries}
        </div>
    );
}
