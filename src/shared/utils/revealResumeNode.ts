/** Reveals a newly rendered node in both editor panes after menu focus restoration completes. */
export function revealResumeNode(uuid: string): void {
    requestAnimationFrame(() => requestAnimationFrame(() => {
        const selector = `[data-uuid="${CSS.escape(uuid)}"]`;
        const canvas = document.querySelector<HTMLElement>(`#resume ${selector}`);
        const tree = document.querySelector<HTMLElement>(`[role="treeitem"]${selector}`);
        canvas?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        tree?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        canvas?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
    }));
}
