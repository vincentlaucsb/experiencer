const canvasMinimums = new WeakMap<HTMLElement, number>();

/** Identifies the adapter's canvas minimum separately from an authored CSS minimum. */
export function configureResumeCanvasMinimum(body: HTMLElement, minHeight: string): () => void {
    const value = Number.parseFloat(minHeight);
    const pixels = minHeight.endsWith('mm') ? value * 96 / 25.4 : value * 96;
    canvasMinimums.set(body, pixels);
    return () => { canvasMinimums.delete(body); };
}

export function getResumeCanvasMinimum(body: HTMLElement): number | undefined {
    return canvasMinimums.get(body);
}
