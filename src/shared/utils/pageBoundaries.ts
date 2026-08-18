import PageSize from '@/types/PageSize';
import {
    calculatePageBoundaries,
    getPageHeightPixels,
    type PageBoundary,
    type UserPageBoundary
} from '@/shared/utils/pageDimensions';

export interface PageBoundaryMeasurement {
    pageHeightPixels: number;
    contentHeightPixels: number;
    boundaries: PageBoundary[];
}

const OVERLAY_CLASS = 'resume-page-boundaries';
const FILLER_PROPERTY = '--page-break-filler';

const sameBoundary = (left: PageBoundary, right: PageBoundary) => {
    if (left.type !== right.type || left.offset !== right.offset) {
        return false;
    }

    return left.type !== 'user' || right.type !== 'user' || left.marginTop === right.marginTop;
};

const sameMeasurement = (
    left: PageBoundaryMeasurement,
    right: PageBoundaryMeasurement
) => (
    left.pageHeightPixels === right.pageHeightPixels
    && left.contentHeightPixels === right.contentHeightPixels
    && left.boundaries.length === right.boundaries.length
    && left.boundaries.every((boundary, index) => sameBoundary(boundary, right.boundaries[index]))
);

function readAppliedFiller(element: HTMLElement): number {
    const parsed = parseFloat(element.style.getPropertyValue(FILLER_PROPERTY));
    return Number.isFinite(parsed) ? parsed : 0;
}

function readMarginTop(element: HTMLElement): number {
    const view = element.ownerDocument.defaultView;
    const marginTop = parseFloat(view?.getComputedStyle(element).marginTop ?? '');
    return Number.isFinite(marginTop) ? marginTop : 0;
}

/** Stretch-absorbing auto margins compute to large pixel values; typical spacing does not. */
const STRETCH_MARGIN_PX = 64;

function isInFlow(element: HTMLElement): boolean {
    const position = element.ownerDocument.defaultView?.getComputedStyle(element).position;
    return position !== 'absolute' && position !== 'fixed';
}

/** Ignores stretched grid items and uses descendant in-flow boxes instead. */
function readContentBottom(resumeRect: DOMRect, element: HTMLElement): number {
    if (element.classList.contains(OVERLAY_CLASS)) {
        return 0;
    }

    if (element.classList.contains('page-break')) {
        return element.getBoundingClientRect().top - resumeRect.top;
    }

    let contentBottom = 0;
    let hasInFlowChild = false;

    for (const child of Array.from(element.children)) {
        if (!(child instanceof HTMLElement) || !isInFlow(child)) {
            continue;
        }

        hasInFlowChild = true;
        const childBottom = readContentBottom(resumeRect, child);
        const stretchMargin = readMarginTop(child);
        contentBottom = Math.max(
            contentBottom,
            stretchMargin > STRETCH_MARGIN_PX ? childBottom - stretchMargin : childBottom
        );
    }

    if (!hasInFlowChild) {
        return element.getBoundingClientRect().bottom - resumeRect.top;
    }

    return contentBottom;
}

function readPrecedingBottom(resumeRect: DOMRect, element: HTMLElement): number {
    let precedingBottom = 0;
    let sibling = element.previousElementSibling;

    while (sibling) {
        if (sibling instanceof HTMLElement
            && !sibling.classList.contains(OVERLAY_CLASS)
            && isInFlow(sibling)) {
            precedingBottom = Math.max(precedingBottom, readContentBottom(resumeRect, sibling));
        }
        sibling = sibling.previousElementSibling;
    }

    return precedingBottom;
}

/**
 * Reads break positions as if leftover-space padding were zero.
 * A newly inserted break can report a 0x0 box; preceding in-flow content is the floor.
 * Later breaks sit below earlier fillers, so those fillers are subtracted in document order.
 */
function collectPageBreaks(resume: HTMLElement, resumeRect: DOMRect) {
    let accumulatedFiller = 0;

    return Array.from(resume.querySelectorAll<HTMLElement>('.page-break')).map((element) => {
        const filler = readAppliedFiller(element);
        const visualOffset = element.getBoundingClientRect().top - resumeRect.top;
        const rawOffset = Math.max(visualOffset, readPrecedingBottom(resumeRect, element));
        const offset = rawOffset - accumulatedFiller;
        accumulatedFiller += filler;
        return { element, offset, filler };
    });
}

/** Reads leftover-space geometry without treating canvas min-height as content. */
export function measurePageBoundaries(
    resume: HTMLElement,
    pageSize: PageSize
): PageBoundaryMeasurement {
    const resumeRect = resume.getBoundingClientRect();
    const pageHeightPixels = getPageHeightPixels(resumeRect.width, pageSize);
    if (pageHeightPixels <= 0) {
        return { pageHeightPixels: 0, contentHeightPixels: 0, boundaries: [] };
    }

    const pageBreaks = collectPageBreaks(resume, resumeRect);

    let paddedExtent = 0;
    for (const child of Array.from(resume.children)) {
        if (!(child instanceof HTMLElement) || child.classList.contains(OVERLAY_CLASS)) {
            continue;
        }

        paddedExtent = Math.max(paddedExtent, readContentBottom(resumeRect, child));
    }

    const appliedFiller = pageBreaks.reduce((total, pageBreak) => total + pageBreak.filler, 0);
    const contentHeightPixels = Math.max(0, paddedExtent - appliedFiller);
    const boundaries = calculatePageBoundaries(
        pageHeightPixels,
        contentHeightPixels,
        pageBreaks.map((pageBreak) => pageBreak.offset)
    );

    return { pageHeightPixels, contentHeightPixels, boundaries };
}

/** Applies computed leftover space as screen-only height on each explicit break. */
export function applyPageBreakFillers(
    resume: HTMLElement,
    boundaries: readonly PageBoundary[]
): void {
    const pageBreaks = collectPageBreaks(resume, resume.getBoundingClientRect());

    const userBoundaries = boundaries.filter((boundary): boundary is UserPageBoundary => (
        boundary.type === 'user'
    ));
    const count = Math.min(pageBreaks.length, userBoundaries.length);

    for (let index = 0; index < count; index += 1) {
        const next = `${userBoundaries[index].marginTop}px`;
        if (pageBreaks[index].element.style.getPropertyValue(FILLER_PROPERTY) !== next) {
            pageBreaks[index].element.style.setProperty(FILLER_PROPERTY, next);
        }
    }

    for (let index = count; index < pageBreaks.length; index += 1) {
        if (pageBreaks[index].element.style.getPropertyValue(FILLER_PROPERTY)) {
            pageBreaks[index].element.style.removeProperty(FILLER_PROPERTY);
        }
    }
}

/** Prevents stretched grid columns from swallowing leftover space below the content. */
function applyEditorPageBreakFlow(resume: HTMLElement): void {
    if (resume.querySelector('.page-break')) {
        resume.style.alignItems = 'start';
        resume.style.alignContent = 'start';
    } else {
        if (resume.style.alignItems === 'start') {
            resume.style.removeProperty('align-items');
        }
        if (resume.style.alignContent === 'start') {
            resume.style.removeProperty('align-content');
        }
    }
}

/** Measures unpadded geometry and writes filler so leftover paper is visible. */
export function syncPageBoundaries(
    resume: HTMLElement,
    pageSize: PageSize
): PageBoundaryMeasurement {
    applyEditorPageBreakFlow(resume);
    applyPageBreakFillers(resume, measurePageBoundaries(resume, pageSize).boundaries);
    const measurement = measurePageBoundaries(resume, pageSize);
    applyPageBreakFillers(resume, measurement.boundaries);
    return measurement;
}

/** Subscribes to layout changes and returns an idempotent cleanup function. */
export function observePageBoundaries(
    resume: HTMLElement,
    pageSize: PageSize,
    onChange: (measurement: PageBoundaryMeasurement) => void
): () => void {
    const view = resume.ownerDocument.defaultView;
    let previous: PageBoundaryMeasurement | undefined;
    let frame: number | undefined;
    let framePending = false;
    let disposed = false;
    let syncing = false;

    const publish = (measurement: PageBoundaryMeasurement) => {
        if (previous && sameMeasurement(previous, measurement)) {
            return;
        }

        previous = measurement;
        onChange(measurement);
    };

    const sync = () => {
        frame = undefined;
        framePending = false;
        if (disposed || syncing) return;

        syncing = true;
        try {
            publish(syncPageBoundaries(resume, pageSize));
        } finally {
            syncing = false;
        }
    };

    const schedule = () => {
        if (disposed || syncing || framePending) return;

        framePending = true;
        const requestFrame = view?.requestAnimationFrame
            ?? ((callback: FrameRequestCallback) => setTimeout(callback, 0));
        frame = requestFrame(sync);
    };

    const cancelFrame = view?.cancelAnimationFrame
        ?? ((id: number) => clearTimeout(id));

    sync();
    view?.addEventListener('resize', schedule);

    const resizeObserver = typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(schedule);
    const watched = new Set<Element>();
    const watch = (element: Element) => {
        if (!resizeObserver || watched.has(element)) return;
        watched.add(element);
        resizeObserver.observe(element);
    };
    const watchLayoutSources = () => {
        watch(resume);
        for (const child of Array.from(resume.children)) {
            watch(child);
        }
        for (const image of Array.from(resume.querySelectorAll('img'))) {
            watch(image);
        }
    };
    watchLayoutSources();

    const onImageLoad = (event: Event) => {
        if (event.target instanceof HTMLImageElement) {
            schedule();
        }
    };
    resume.addEventListener('load', onImageLoad, true);

    const mutationObserver = typeof MutationObserver === 'undefined'
        ? undefined
        : new MutationObserver(() => {
            watchLayoutSources();
            schedule();
        });
    mutationObserver?.observe(resume, {
        characterData: true,
        childList: true,
        subtree: true
    });

    void resume.ownerDocument.fonts?.ready.then(() => {
        if (!disposed) schedule();
    });

    return () => {
        disposed = true;
        view?.removeEventListener('resize', schedule);
        resume.removeEventListener('load', onImageLoad, true);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        if (frame !== undefined) {
            cancelFrame(frame);
            frame = undefined;
        }
        framePending = false;
    };
}
