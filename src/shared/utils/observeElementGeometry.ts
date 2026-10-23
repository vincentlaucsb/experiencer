export interface ElementGeometry {
    bounds: DOMRect;
    computedStyle: CSSStyleDeclaration;
    boundary: Pick<DOMRect, 'top' | 'right' | 'bottom' | 'left'>;
}

/** Tracks an overlay anchor through scrolling, sizing and sibling layout changes. */
export function observeElementGeometry(
    element: Element,
    layoutRoot: Element | null | undefined,
    onChange: (geometry: ElementGeometry) => void
): () => void {
    const view = element.ownerDocument.defaultView;
    if (!view) return () => {};
    let frame: number | undefined;
    let disposed = false;

    const measure = () => {
        frame = undefined;
        if (disposed) return;
        onChange({
            bounds: element.getBoundingClientRect(),
            computedStyle: view.getComputedStyle(element),
            boundary: layoutRoot?.getBoundingClientRect() ?? {
                top: 0, left: 0, right: view.innerWidth, bottom: view.innerHeight
            }
        });
    };
    const schedule = () => {
        if (disposed || frame !== undefined) return;
        frame = view.requestAnimationFrame(measure);
    };

    measure();
    view.addEventListener('resize', schedule);
    view.addEventListener('scroll', schedule, true);
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(schedule);
    resizeObserver?.observe(element);
    if (layoutRoot) resizeObserver?.observe(layoutRoot);

    // A sibling can move an anchor without resizing either the anchor or its
    // scroll pane (for example when dismissing a normal-flow onboarding note).
    const mutations = typeof MutationObserver === 'undefined' ? undefined : new MutationObserver(schedule);
    mutations?.observe(layoutRoot ?? element.parentElement ?? element, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: ['class', 'style', 'hidden']
    });

    return () => {
        disposed = true;
        resizeObserver?.disconnect();
        mutations?.disconnect();
        view.removeEventListener('resize', schedule);
        view.removeEventListener('scroll', schedule, true);
        if (frame !== undefined) view.cancelAnimationFrame(frame);
    };
}
