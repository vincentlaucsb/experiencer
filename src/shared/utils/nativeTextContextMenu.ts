const textInputTypes = new Set(["text", "search", "url", "email", "tel", ""]);

/** True for an enabled control where the browser offers editing and spelling menus. */
export function isTextEntryTarget(target: EventTarget | null): boolean {
    if (target instanceof HTMLTextAreaElement) return !target.disabled && !target.readOnly;
    if (target instanceof HTMLInputElement) {
        return textInputTypes.has(target.type) && !target.disabled && !target.readOnly;
    }
    return target instanceof HTMLElement && target.isContentEditable;
}

/**
 * Lets right-clicks inside text-entry controls reach the browser's own menu,
 * which carries spelling suggestions, clipboard commands, and input methods.
 *
 * Résumé node menus listen on every ancestor container and cancel the native
 * menu, and an ancestor's right-button mousedown reselects it, which ends the
 * field's edit. Both events must stop at the host during capture, before any
 * container sees them.
 */
export function preserveNativeTextContextMenu(host: HTMLElement): () => void {
    const handle = (event: MouseEvent) => {
        if (event.type === "mousedown" && event.button !== 2) return;
        if (isTextEntryTarget(event.target)) event.stopPropagation();
    };
    host.addEventListener("mousedown", handle, true);
    host.addEventListener("contextmenu", handle, true);
    return () => {
        host.removeEventListener("mousedown", handle, true);
        host.removeEventListener("contextmenu", handle, true);
    };
}
