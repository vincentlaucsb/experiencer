import { getResumeCanvasMinimum } from '@/shared/resumeDocument/resumeDocumentCanvas';
import PageSize from '@/types/PageSize';

type Geometry = Record<string, string>;
type Side = 'top' | 'bottom';

/** BODY owns page insets by default; designed full-bleed documents explicitly declare flows. */
export function getResumePrintGeometry(body: HTMLElement, pageSize: PageSize): Readonly<Geometry> {
    const view = body.ownerDocument.defaultView;
    if (!view) throw new Error('The saved résumé page geometry is unavailable.');
    const style = view.getComputedStyle(body);
    const authoredTop = readInset(style, 'top');
    const authoredBottom = readInset(style, 'bottom');
    const fallback = defaultInset(body, style);
    const pageHeight = pageSize === PageSize.A4 ? 297 * 96 / 25.4 : 1056;
    const hasBodyFrame = Number.parseFloat(style.borderTopWidth) > 0 || Number.parseFloat(style.borderBottomWidth) > 0;
    // Declaring BODY geometry takes precedence as a whole: mixing cloned BODY decoration
    // with synthesized inner insets produces inconsistent native Grid fragmentation.
    const flowLayout = style.getPropertyValue('--resume-page-layout').trim() === 'flow'
        && authoredTop === 0 && authoredBottom === 0 && !hasBodyFrame;
    const owners = flowLayout ? declaredFlowOwners(body) : [];
    const flowOwned = owners.length > 0;
    const top = flowOwned ? 0 : authoredTop || fallback;
    const bottom = flowOwned ? 0 : authoredBottom || fallback;
    const geometry: Geometry = {};
    if (flowOwned) {
        // BODY-owned layouts retain authored descendant decoration, including continuous gradients.
        for (const owner of owners) geometry[`--resume-fragment-${owner.dataset.uuid}`] = 'clone';
        prepareFlowInset(geometry, owners, 'top', fallback, body, pageHeight);
        prepareFlowInset(geometry, owners, 'bottom', fallback, body, pageHeight);
    }

    const previewMinimum = Number.parseFloat(style.minHeight);
    const managedMinimum = getResumeCanvasMinimum(body);
    const managed = managedMinimum !== undefined && Math.abs(previewMinimum - managedMinimum) < 1;
    const minimumPages = managed ? Math.max(1, Math.round(managedMinimum / pageHeight)) : 1;
    const nestedContinuation = body.querySelector(':scope > .grid-container > .column > .page-break');
    // A managed multi-page preview canvas is not authored content. Native breaks own its
    // page allocation; retain one paper canvas so short authored frames agree in PNG/PDF.
    // Nested parallel continuations still need the shared minimum to paint sparse rails.
    const minimum = managed && !nestedContinuation ? Math.min(previewMinimum, pageHeight)
        : previewMinimum - (minimumPages - 1) * (top + bottom);
    if (!Number.isFinite(minimum)) throw new Error('The saved résumé has unsupported page geometry.');
    return {
        ...geometry,
        'min-height': `${Math.max(0, minimum)}px`,
        'margin-top': '0', 'margin-bottom': '0', 'margin-left': '0', 'margin-right': '0',
        'padding-left': `${readInset(style, 'left') || (flowOwned ? 0 : fallback)}px`,
        'padding-right': `${readInset(style, 'right') || (flowOwned ? 0 : fallback)}px`,
        'padding-top': `${top}px`, 'padding-bottom': `${bottom}px`,
        '-webkit-box-decoration-break': 'clone', 'box-decoration-break': 'clone'
    };
}

/** Canonical columns and explicit vertical flows opt in without inferring inner margin rules. */
function declaredFlowOwners(body: HTMLElement): HTMLElement[] {
    const view = body.ownerDocument.defaultView!;
    const candidates = Array.from(body.querySelectorAll<HTMLElement>('[data-uuid]')).filter(node =>
        node.classList.contains('column') || view.getComputedStyle(node).getPropertyValue('--resume-page-flow').trim() === '1');
    const selected = new Set(candidates);
    return candidates.filter(node => {
        for (let parent = node.parentElement; parent && parent !== body; parent = parent.parentElement) {
            if (selected.has(parent)) return false;
        }
        return true;
    });
}

/** Keep the initial full-bleed design while reserving clearance on subsequent flow fragments. */
function prepareFlowInset(geometry: Geometry, owners: HTMLElement[], side: Side, fallback: number, body: HTMLElement, pageHeight: number): void {
    for (const owner of owners) {
        const style = owner.ownerDocument.defaultView!.getComputedStyle(owner);
        const padding = Number.parseFloat(style.getPropertyValue(`padding-${side}`)) || 0;
        if (padding > 0 || fallback === 0) continue;
        geometry[`--resume-inset-${owner.dataset.uuid}-${side}`] = `${fallback}px`;
        if (side === 'top' && !startsOnFirstPage(owner, body, pageHeight)) continue;
        const children = Array.from(owner.children).filter((child): child is HTMLElement => child instanceof owner.ownerDocument.defaultView!.HTMLElement);
        const edges = children.map(child => child.getBoundingClientRect()[side]);
        const edge = side === 'top' ? Math.min(...edges) : Math.max(...edges);
        children.forEach((child, index) => {
            if (Math.abs(edges[index] - edge) >= 1) return;
            const childStyle = owner.ownerDocument.defaultView!.getComputedStyle(child);
            const margin = Number.parseFloat(childStyle.getPropertyValue(`margin-${side}`)) || 0;
            const ordinal = Array.from(owner.children).indexOf(child) + 1;
            geometry[`--resume-edge-${owner.dataset.uuid}-${ordinal}-${side}`] = `${margin - fallback}px`;
        });
    }
}

function startsOnFirstPage(owner: HTMLElement, body: HTMLElement, pageHeight: number): boolean {
    if (owner.getBoundingClientRect().top - body.getBoundingClientRect().top >= pageHeight) return false;
    for (let current: HTMLElement | null = owner; current && current !== body; current = current.parentElement) {
        for (let previous = current.previousElementSibling; previous; previous = previous.previousElementSibling) {
            if (previous.matches('.page-break')) return false;
            if (previous.getBoundingClientRect().bottom <= current.getBoundingClientRect().top + 1
                && previous.querySelector('.page-break')) return false;
        }
    }
    return true;
}

function readInset(style: CSSStyleDeclaration, side: Side | 'left' | 'right'): number {
    const margin = Number.parseFloat(style.getPropertyValue(`margin-${side}`)) || 0;
    const padding = Number.parseFloat(style.getPropertyValue(`padding-${side}`)) || 0;
    return Math.max(0, margin + padding);
}

/** Invalid optional CSS retains the physical default; explicit zero opts out of fallback insets. */
function defaultInset(body: HTMLElement, style: CSSStyleDeclaration): number {
    const probe = body.ownerDocument.createElement('div');
    probe.style.cssText = 'all:unset!important;position:absolute!important;visibility:hidden!important;pointer-events:none!important;width:0!important;height:0!important;min-height:0!important;max-height:none!important;margin:0!important;padding:0!important;border:0!important;box-sizing:content-box!important;';
    probe.style.setProperty('padding-top', '0.5in', 'important');
    for (const key of ['--edge-margin', '--resume-page-inset']) {
        const configured = style.getPropertyValue(key).trim();
        if (configured) probe.style.setProperty('padding-top', configured, 'important');
    }
    body.appendChild(probe);
    try { return Math.max(0, Number.parseFloat(body.ownerDocument.defaultView!.getComputedStyle(probe).paddingTop)); }
    finally { probe.remove(); }
}

/** Adapter styles address canonical identities and never mutate authored or persisted CSS. */
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
