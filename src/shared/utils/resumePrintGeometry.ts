import PageSize from '@/types/PageSize';

/** Resolve authored page insets and the logical canvas extent used by native print fragmentation. */
export function getResumePrintGeometry(body: HTMLElement, pageSize: PageSize): Readonly<Record<string, string>> {
    const style = body.ownerDocument.defaultView?.getComputedStyle(body);
    if (!style) throw new Error('The saved résumé page geometry is unavailable.');
    const top = inset(style.marginTop, style.paddingTop);
    const bottom = inset(style.marginBottom, style.paddingBottom);
    const pageHeight = pageSize === PageSize.A4 ? 297 * 96 / 25.4 : 11 * 96;
    const previewMinimum = Number.parseFloat(style.minHeight);
    const minimumPages = Math.max(1, Math.round(previewMinimum / pageHeight));
    // Each cloned root fragment repeats its insets. Counting those again in the continuous
    // minimum creates an extra blank page. Direct body grids paint their rail on the canvas.
    const nestedContinuation = body.querySelector(':scope > .grid-container > .column > .page-break');
    const minimum = nestedContinuation ? previewMinimum - (minimumPages - 1) * (top + bottom) : 0;
    if (!Number.isFinite(minimum)) throw new Error('The saved résumé has unsupported page geometry.');
    return {
        'min-height': `${Math.max(0, minimum)}px`,
        'margin-top': '0', 'margin-bottom': '0',
        'padding-top': `${top}px`, 'padding-bottom': `${bottom}px`,
        '-webkit-box-decoration-break': 'clone', 'box-decoration-break': 'clone'
    };
}

function inset(margin: string, padding: string): number {
    const total = Number.parseFloat(margin) + Number.parseFloat(padding);
    if (!Number.isFinite(total)) throw new Error('The saved résumé has unsupported vertical page geometry.');
    return Math.max(0, total);
}
