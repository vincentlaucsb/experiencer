export const MINIMUM_MARKDOWN_EDITOR_HEIGHT = 220;

/** Measures source content and keeps its editor and actions above the viewport edge. */
export class MarkdownEditorSizing {
    private frame?: number;
    private observer: ResizeObserver;
    private mutations: MutationObserver;
    private lastHeight = MINIMUM_MARKDOWN_EDITOR_HEIGHT;
    private contentHeight = MINIMUM_MARKDOWN_EDITOR_HEIGHT;
    private disposed = false;
    private readonly view: Window;

    constructor(private readonly host: HTMLElement, private readonly setHeight: (height: number) => void) {
        this.view = host.ownerDocument.defaultView!;
        this.observer = new ResizeObserver(this.refresh);
        this.observer.observe(host);
        this.mutations = new MutationObserver(this.refresh);
        // Preview/fullscreen switches change available source width and positioning.
        this.mutations.observe(host, { subtree: true, attributes: true, attributeFilter: ['class'] });
        this.view.addEventListener('resize', this.refresh);
        this.view.addEventListener('scroll', this.refresh, true);
        this.refresh();
    }

    refresh = () => {
        if (this.disposed || this.frame !== undefined) return;
        this.frame = this.view.requestAnimationFrame(this.measure);
    };

    private measure = () => {
        this.frame = undefined;
        const editor = this.host.querySelector<HTMLElement>('.w-md-editor');
        const input = this.host.querySelector<HTMLTextAreaElement>('textarea');
        if (!editor || editor.classList.contains('w-md-editor-fullscreen')) return;
        const editorHeight = editor.getBoundingClientRect().height;
        const extraHeight = editorHeight - parseFloat(this.view.getComputedStyle(editor).height);
        // Preview-only mode keeps the measured source size, but still follows the viewport.
        if (input && input.clientWidth > 0) {
            const chromeHeight = editorHeight - input.getBoundingClientRect().height;
            const previousHeight = input.style.height;
            const scrollTop = input.scrollTop;
            // Collapse only for this synchronous measurement so deleting text can shrink too.
            input.style.height = '0px';
            this.contentHeight = input.scrollHeight + chromeHeight - extraHeight;
            input.style.height = previousHeight;
            input.scrollTop = scrollTop;
        }

        const overlay = this.host.closest<HTMLElement>('.resume-overlay-editor') ?? this.host;
        const bounds = overlay.getBoundingClientRect();
        const outsideEditor = bounds.height - editorHeight;
        // Reuse the overlay's computed app-p-4 spacing, which resolves rem tokens to pixels.
        const edgeGap = parseFloat(this.view.getComputedStyle(overlay).paddingBottom);
        const availableHeight = this.view.innerHeight - bounds.top - outsideEditor - extraHeight - edgeGap;
        // The established minimum takes precedence when the anchor is near the edge.
        const height = Math.floor(Math.max(MINIMUM_MARKDOWN_EDITOR_HEIGHT,
            Math.min(this.contentHeight, availableHeight)));
        if (height === this.lastHeight) return;
        this.lastHeight = height;
        this.setHeight(height);
    };

    dispose = () => {
        this.disposed = true;
        this.observer.disconnect();
        this.mutations.disconnect();
        this.view.removeEventListener('resize', this.refresh);
        this.view.removeEventListener('scroll', this.refresh, true);
        if (this.frame !== undefined) this.view.cancelAnimationFrame(this.frame);
    };
}
