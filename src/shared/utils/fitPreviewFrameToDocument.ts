/** Sizes an opt-in preview's outer frame without adding application styles to its document. */
export function fitPreviewFrameToDocument(target: Document | null, enabled = false): (() => void) | undefined {
    const frame = target?.defaultView?.frameElement as HTMLIFrameElement | null;
    if (!enabled || !target || !frame) return;
    const previousWidth = frame.style.width;
    const previousHeight = frame.style.height;
    const measure = () => {
        const body = target.body;
        const bounds = body.getBoundingClientRect();
        frame.style.width = `${bounds.width}px`;
        // Root bounds include margins that collapse outside the body on unstyled documents.
        // scrollHeight on the root is viewport-sized and would prevent a preview from shrinking.
        frame.style.height = `${Math.ceil(Math.max(
            target.documentElement.getBoundingClientRect().height,
            bounds.top + bounds.height,
            bounds.top + body.scrollHeight
        ))}px`;
    };
    const observer = new ResizeObserver(measure);
    observer.observe(target.body);
    observer.observe(target.documentElement);
    measure();
    return () => {
        observer.disconnect();
        frame.style.width = previousWidth;
        frame.style.height = previousHeight;
    };
}
