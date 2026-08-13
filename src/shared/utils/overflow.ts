/** The small, DOM-only measurement contract shared by responsive controls. */
export interface HorizontalOverflowMeasurement {
    clientWidth: number;
    scrollWidth: number;
    isOverflowing: boolean;
}

export interface HorizontalOverflowObserverOptions {
    tolerance?: number;
    observeMutations?: boolean;
}

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
        if (!sameMeasurement(previous, next)) {
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
