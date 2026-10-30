import PageSize from '@/types/PageSize';

type Geometry = Record<string, string>;
type Side = 'top' | 'bottom';

/** Resolve one repeated inset owner per side and layout flow without changing saved CSS. */
export function getResumePrintGeometry(body: HTMLElement, pageSize: PageSize): Readonly<Geometry> {
    const view = body.ownerDocument.defaultView;
    if (!view) throw new Error('The saved résumé page geometry is unavailable.');
    const style = view.getComputedStyle(body);
    const authoredTop = readInset(style, 'top');
    const authoredBottom = readInset(style, 'bottom');
    const fallback = defaultInset(body, style);
    const roots = Array.from(body.querySelectorAll<HTMLElement>(':scope > [data-uuid]'));
    const owners = roots.flatMap(collectFlowOwners);
    const geometry: Geometry = {};
    for (const owner of owners) geometry[`--resume-fragment-${owner.dataset.uuid}`] = 'clone';
    const top = owners.length && authoredTop === 0 ? 0 : authoredTop || fallback;
    const bottom = owners.length && authoredBottom === 0 ? 0 : authoredBottom || fallback;
    if (owners.length && authoredTop === 0) prepareFlowInset(geometry, owners, 'top', fallback, body);
    if (owners.length && authoredBottom === 0) prepareFlowInset(geometry, owners, 'bottom', fallback, body);

    const pageHeight = pageSize === PageSize.A4 ? 297 * 96 / 25.4 : 1056;
    const previewMinimum = Number.parseFloat(style.minHeight);
    const minimumPages = Math.max(1, Math.round(previewMinimum / pageHeight));
    const nestedContinuation = body.querySelector(':scope > .grid-container > .column > .page-break');
    // Only body-owned padding expands its minimum when cloned. Flow-owned padding consumes
    // space within each flow's fragment; subtracting it here truncates full-height decorations.
    const minimum = nestedContinuation ? previewMinimum - (minimumPages - 1) * (top + bottom) : 0;
    if (!Number.isFinite(minimum)) throw new Error('The saved résumé has unsupported page geometry.');
    return {
        ...geometry,
        'min-height': `${Math.max(0, minimum)}px`,
        'margin-top': '0', 'margin-bottom': '0', 'margin-left': '0', 'margin-right': '0',
        'padding-left': `${readInset(style, 'left')}px`, 'padding-right': `${readInset(style, 'right')}px`,
        'padding-top': `${top}px`, 'padding-bottom': `${bottom}px`,
        '-webkit-box-decoration-break': 'clone', 'box-decoration-break': 'clone'
    };
}

/** Parallel layout containers may mix columns and ordinary flows; every branch needs an owner. */
function collectFlowOwners(node: HTMLElement): HTMLElement[] {
    if (node.classList.contains('page-break')) return [];
    if (node.matches('.grid-container, .row') && node.querySelector('.column')) {
        return Array.from(node.querySelectorAll<HTMLElement>(':scope > [data-uuid]')).flatMap(collectFlowOwners);
    }
    return [node];
}

/** Margins truncate at breaks, so repeat their intended clearance as padding on the owning flow. */
function prepareFlowInset(geometry: Geometry, owners: HTMLElement[], side: Side, fallback: number, body: HTMLElement): void {
    for (const owner of owners) {
        const style = owner.ownerDocument.defaultView!.getComputedStyle(owner);
        const padding = Number.parseFloat(side === 'top' ? style.paddingTop : style.paddingBottom) || 0;
        const value = readInset(style, side) || inheritedInset(owner.parentElement, body, side) || fallback;
        if (value === padding) continue;
        geometry[`--resume-inset-${owner.dataset.uuid}-${side}`] = `${value}px`;
        const children = Array.from(owner.children).filter((child): child is HTMLElement => child instanceof owner.ownerDocument.defaultView!.HTMLElement);
        const edges = children.map(child => child.getBoundingClientRect()[side]);
        const edge = side === 'top' ? Math.min(...edges) : Math.max(...edges);
        children.forEach((child, index) => {
            if (Math.abs(edges[index] - edge) >= 1) return;
            const childStyle = owner.ownerDocument.defaultView!.getComputedStyle(child);
            const margin = Number.parseFloat(side === 'top' ? childStyle.marginTop : childStyle.marginBottom) || 0;
            const ordinal = Array.from(owner.children).indexOf(child) + 1;
            geometry[`--resume-edge-${owner.dataset.uuid}-${ordinal}-${side}`] = `${margin + padding - value}px`;
        });
    }
}

function inheritedInset(parent: HTMLElement | null, body: HTMLElement, side: Side): number {
    for (let current = parent; current && current !== body; current = current.parentElement) {
        const value = readInset(current.ownerDocument.defaultView!.getComputedStyle(current), side);
        if (value > 0) return value;
    }
    return 0;
}

function readInset(style: CSSStyleDeclaration, side: Side | 'left' | 'right'): number {
    const margin = Number.parseFloat(style.getPropertyValue(`margin-${side}`)) || 0;
    const padding = Number.parseFloat(style.getPropertyValue(`padding-${side}`)) || 0;
    return Math.max(0, margin + padding);
}

/** An explicit zero permits zero insets; invalid optional CSS retains the physical default. */
function defaultInset(body: HTMLElement, style: CSSStyleDeclaration): number {
    const probe = body.ownerDocument.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;width:0;height:0;min-height:0;border:0;box-sizing:content-box;padding-top:0.5in;';
    // Use the browser's padding grammar: auto/negative heights are not length insets.
    // Invalid optional values leave the preceding fallback intact; explicit zero is valid.
    for (const key of ['--edge-margin', '--resume-page-inset']) {
        const configured = style.getPropertyValue(key).trim();
        if (configured) probe.style.paddingTop = configured;
    }
    body.appendChild(probe);
    try { return Math.max(0, probe.getBoundingClientRect().height); }
    finally { probe.remove(); }
}

/** Adapter-only styles address canonical UUIDs; the authored tree and its cascade stay intact. */
export function getResumeFragmentRules(geometry: Readonly<Geometry>): string {
    return Object.keys(geometry).flatMap(key => {
        const fragment = /^--resume-fragment-([a-f0-9-]+)$/i.exec(key);
        if (fragment) return [`[data-uuid="${fragment[1]}"] { -webkit-box-decoration-break: clone; box-decoration-break: clone; }`];
        const inset = /^--resume-inset-([a-f0-9-]+)-(top|bottom)$/i.exec(key);
        if (inset) return [`[data-uuid="${inset[1]}"] { padding-${inset[2]}: var(${key}) !important; }`];
        const edge = /^--resume-edge-([a-f0-9-]+)-(\d+)-(top|bottom)$/i.exec(key);
        return edge ? [`[data-uuid="${edge[1]}"] > :nth-child(${edge[2]}) { margin-${edge[3]}: var(${key}) !important; }`] : [];
    }).join('\n');
}
