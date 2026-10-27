/** Geometry-only evidence: never include resume text, URLs, labels, or authored IDs. */
export interface ResumeTextOverflowFinding {
    nodeId: string;
    page: number;
    boundary: 'page' | 'column' | 'clipped';
    leftPixels: number;
    rightPixels: number;
}

export interface ResumeTextOverflow {
    count: number;
    truncated: boolean;
    findings: ResumeTextOverflowFinding[];
}

export const emptyResumeTextOverflow: ResumeTextOverflow = { count: 0, truncated: false, findings: [] };
const maximumFindings = 20;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Measures painted text against physical paper, column content boxes, and clipping ancestors. */
export function measureResumeTextOverflow(root: HTMLElement, pageHeight: number): ResumeTextOverflow {
    const doc = root.ownerDocument, view = doc.defaultView;
    const origin = root.getBoundingClientRect();
    if (!view || origin.width <= 0 || pageHeight <= 0) return emptyResumeTextOverflow;
    const findings = new Map<string, ResumeTextOverflowFinding>();
    const walker = doc.createTreeWalker(root, view.NodeFilter.SHOW_TEXT);
    let node = walker.nextNode();
    while (node) {
        const parent = node.parentElement;
        if (!parent || !node.textContent?.trim() || parent.closest(
            'style,script,svg,canvas,button,input,textarea,select,.no-print,.page-break,.page-boundaries,.render-page-boundary,[contenteditable="true"]'
        )) { node = walker.nextNode(); continue; }
        const textStyle = view.getComputedStyle(parent);
        const color = textStyle.getPropertyValue('-webkit-text-fill-color') || textStyle.color;
        const transparent = color === 'transparent'
            || ((color.startsWith('rgba(') || color.includes('/')) && /[,/]\s*0(?:\.0+)?%?\s*\)$/.test(color));
        if (transparent) { node = walker.nextNode(); continue; }
        const boundaries: { boundary: ResumeTextOverflowFinding['boundary']; left: number; right: number }[] = [
            { boundary: 'page', left: origin.left, right: origin.right }
        ];
        let visible = true;
        for (let ancestor: HTMLElement | null = parent; ancestor; ancestor = ancestor.parentElement) {
            const style = view.getComputedStyle(ancestor);
            if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) { visible = false; break; }
            const clipped = ['hidden', 'clip', 'scroll', 'auto'].includes(style.overflowX);
            if (ancestor !== root && (ancestor.classList.contains('column') || clipped)) {
                const rect = ancestor.getBoundingClientRect();
                const scale = ancestor.offsetWidth > 0 ? rect.width / ancestor.offsetWidth : 1;
                const inset = (side: string) => ((parseFloat(style.getPropertyValue(`padding-${side}`)) || 0)
                    + (parseFloat(style.getPropertyValue(`border-${side}-width`)) || 0)) * scale;
                boundaries.push({ boundary: clipped ? 'clipped' : 'column', left: rect.left + inset('left'), right: rect.right - inset('right') });
            }
            if (ancestor === root) break;
        }
        if (visible) {
            const range = doc.createRange();
            range.selectNodeContents(node);
            for (const rect of range.getClientRects()) {
                if (rect.width <= 0 || rect.height <= 0) continue;
                const page = Math.max(1, Math.floor((rect.top - origin.top) / pageHeight) + 1);
                const id = parent.closest<HTMLElement>('[data-uuid]')?.dataset.uuid ?? '';
                const nodeId = uuidPattern.test(id) ? id : '';
                for (const bounds of boundaries) {
                    const leftPixels = Math.max(0, bounds.left - rect.left), rightPixels = Math.max(0, rect.right - bounds.right);
                    if (leftPixels <= 1 && rightPixels <= 1) continue;
                    const key = `${nodeId}:${page}:${bounds.boundary}`;
                    const previous = findings.get(key);
                    findings.set(key, { nodeId, page, boundary: bounds.boundary,
                        leftPixels: Math.round(Math.max(previous?.leftPixels ?? 0, leftPixels) * 100) / 100,
                        rightPixels: Math.round(Math.max(previous?.rightPixels ?? 0, rightPixels) * 100) / 100 });
                }
            }
            range.detach();
        }
        node = walker.nextNode();
    }
    return { count: findings.size, truncated: findings.size > maximumFindings, findings: [...findings.values()].slice(0, maximumFindings) };
}

/** Owns observer scheduling and ignores editor-only controls without changing authored layout. */
export function observeResumeTextOverflow(root: HTMLElement, pageHeight: () => number, publish: (value: ResumeTextOverflow) => void): () => void {
    const view = root.ownerDocument.defaultView!;
    let frame: number | undefined;
    let disposed = false;
    const schedule = () => {
        if (disposed || frame !== undefined) return;
        frame = view.requestAnimationFrame(() => {
            frame = undefined;
            if (!disposed) publish(measureResumeTextOverflow(root, pageHeight()));
        });
    };
    const resize = typeof view.ResizeObserver === 'function' ? new view.ResizeObserver(schedule) : undefined;
    resize?.observe(root);
    const mutations = new view.MutationObserver(schedule);
    mutations.observe(root, { subtree: true, attributes: true, childList: true, characterData: true });
    mutations.observe(root.ownerDocument.head, { subtree: true, attributes: true, childList: true, characterData: true });
    root.addEventListener('load', schedule, true);
    view.addEventListener('resize', schedule);
    root.ownerDocument.fonts?.addEventListener('loadingdone', schedule);
    schedule();
    return () => {
        disposed = true;
        if (frame !== undefined) view.cancelAnimationFrame(frame);
        resize?.disconnect();
        root.removeEventListener('load', schedule, true);
        mutations.disconnect();
        view.removeEventListener('resize', schedule);
        root.ownerDocument.fonts?.removeEventListener('loadingdone', schedule);
    };
}
