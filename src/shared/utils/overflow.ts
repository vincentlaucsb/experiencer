/** The small, DOM-only measurement contract shared by responsive controls. */
export interface HorizontalOverflowMeasurement {
    clientWidth: number;
    scrollWidth: number;
    isOverflowing: boolean;
}

export interface HorizontalOverflowObserverOptions {
    tolerance?: number;
    observeMutations?: boolean;
    /** Notify after every observed layout mutation, even when overflow dimensions are unchanged. */
    notifyOnEveryObservation?: boolean;
}

export type HorizontalOverflowMeasure = (
    element: HTMLElement,
    tolerance?: number
) => HorizontalOverflowMeasurement;

const sameMeasurement = (
    left: HorizontalOverflowMeasurement,
    right: HorizontalOverflowMeasurement
) => (
    left.clientWidth === right.clientWidth
    && left.scrollWidth === right.scrollWidth
    && left.isOverflowing === right.isOverflowing
);

/** Reads horizontal overflow without coupling layout decisions to React. */
export function measureHorizontalOverflow(
    element: HTMLElement,
    tolerance = 1
): HorizontalOverflowMeasurement {
    const clientWidth = element.clientWidth;
    const scrollWidth = element.scrollWidth;

    return {
        clientWidth,
        scrollWidth,
        isOverflowing: clientWidth > 0 && scrollWidth > clientWidth + tolerance
    };
}

/** Measures flex content whose shrinkable children can overlap before the parent scrolls. */
export function measureHorizontalChildOverflow(
    element: HTMLElement,
    tolerance = 1
): HorizontalOverflowMeasurement {
    const view = element.ownerDocument.defaultView;
    const style = view?.getComputedStyle(element);
    const gap = Number.parseFloat(style?.columnGap ?? style?.gap ?? "0") || 0;
    const horizontalPadding = (Number.parseFloat(style?.paddingLeft ?? "0") || 0)
        + (Number.parseFloat(style?.paddingRight ?? "0") || 0);
    const children = Array.from(element.children).filter(
        (child): child is HTMLElement => child instanceof HTMLElement
    );
    const measuredChildren = children.map((child) => {
        const childStyle = view?.getComputedStyle(child);
        const margins = (Number.parseFloat(childStyle?.marginLeft ?? "0") || 0)
            + (Number.parseFloat(childStyle?.marginRight ?? "0") || 0);
        const bounds = child.getBoundingClientRect();
        return {
            bounds,
            width: Math.max(child.scrollWidth, bounds.width) + margins
        };
    }).filter((child) => child.width > 0);
    const rows: Array<{ top: number; bottom: number; width: number }> = [];
    measuredChildren.forEach((child) => {
        const hasVerticalBounds = child.bounds.height > 0;
        const row = hasVerticalBounds
            ? rows.find((candidate) => (
                child.bounds.top < candidate.bottom
                && child.bounds.bottom > candidate.top
            ))
            : rows[0];
        if (row) {
            row.top = Math.min(row.top, child.bounds.top);
            row.bottom = Math.max(row.bottom, child.bounds.bottom);
            row.width += gap + child.width;
        }
        else {
            rows.push({
                top: child.bounds.top,
                bottom: child.bounds.bottom,
                width: child.width
            });
        }
    });
    const childrenWidth = rows.reduce(
        (maximum, row) => Math.max(maximum, row.width),
        0
    );
    // clientWidth/scrollWidth include padding, while flex children lay out in
    // the content box. Keep both sides of the comparison in content-box units.
    const clientWidth = Math.max(0, element.clientWidth - horizontalPadding);
    const scrollWidth = Math.max(
        Math.max(0, element.scrollWidth - horizontalPadding),
        childrenWidth
    );

    return {
        clientWidth,
        scrollWidth,
        isOverflowing: clientWidth > 0 && scrollWidth > clientWidth + tolerance
    };
}

/** Subscribes to meaningful overflow changes and returns an idempotent cleanup function. */
export function observeHorizontalOverflow(
    element: HTMLElement,
    onChange: (measurement: HorizontalOverflowMeasurement) => void,
    options: HorizontalOverflowObserverOptions = {}
): () => void {
    const tolerance = options.tolerance ?? 1;
    const view = element.ownerDocument.defaultView;
    let previous = measureHorizontalOverflow(element, tolerance);
    let frame: number | undefined;
    let framePending = false;
    let disposed = false;

    const measure = () => {
        frame = undefined;
        framePending = false;
        if (disposed) return;

        const next = measureHorizontalOverflow(element, tolerance);
        if (options.notifyOnEveryObservation || !sameMeasurement(previous, next)) {
            previous = next;
            onChange(next);
        }
    };

    const schedule = () => {
        if (framePending) return;
        framePending = true;

        const requestFrame = view?.requestAnimationFrame
            ?? ((callback: FrameRequestCallback) => setTimeout(callback, 0));
        frame = requestFrame(measure);
    };

    const cancelFrame = view?.cancelAnimationFrame
        ?? ((id: number) => clearTimeout(id));

    onChange(previous);
    view?.addEventListener("resize", schedule);

    const resizeObserver = typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(schedule);
    resizeObserver?.observe(element);

    const mutationObserver = options.observeMutations && typeof MutationObserver !== "undefined"
        ? new MutationObserver(schedule)
        : undefined;
    mutationObserver?.observe(element, {
        attributes: true,
        characterData: true,
        childList: true,
        subtree: true
    });

    return () => {
        disposed = true;
        view?.removeEventListener("resize", schedule);
        resizeObserver?.disconnect();
        mutationObserver?.disconnect();
        if (frame !== undefined) {
            cancelFrame(frame);
            frame = undefined;
        }
        framePending = false;
    };
}
