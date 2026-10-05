/**
 * Marks controls that own their keyboard input, such as CSS declaration rows.
 *
 * Invariant: a key event that starts inside a marked element must not run a
 * global action on the selected résumé node (delete, cut, copy, paste, or
 * Escape-to-deselect). Focus can rest on such a control while a node is still
 * selected, so those shortcuts would otherwise act on a node the user is not
 * looking at. Document-wide commands such as save, undo, and redo still apply.
 */
export const localKeyboardScopeAttributes = { "data-local-keyboard": "true" } as const;

/** Whether a key event started inside a control marked with `localKeyboardScopeAttributes`. */
export function isFromLocalKeyboardScope(event?: Pick<Event, "target">): boolean {
    const target = event?.target;
    return target instanceof Element && target.closest("[data-local-keyboard]") !== null;
}
