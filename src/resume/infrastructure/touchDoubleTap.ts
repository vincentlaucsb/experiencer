/**
 * Touch double-tap tracking for résumé nodes.
 *
 * On desktop a double-click is two clicks on the same node: the first selects it
 * and the second, landing on the now-selected node, opens its editor. On a phone
 * the first tap's selection swaps the wrapped editing toolbar for a different
 * number of rows, so the canvas moves under the finger and the second tap lands
 * on a neighbouring node. A second touch tap that arrives quickly and close to
 * the first is therefore treated as a double-tap on the node the first tap
 * selected, whatever is under the finger now.
 */

/** Longest gap between the two taps of a double-tap. */
export const TOUCH_DOUBLE_TAP_MS = 450;

/** Farthest the second tap may land from the first, in CSS pixels on screen. */
export const TOUCH_DOUBLE_TAP_SLOP_PX = 32;

interface TouchTap {
    uuid: string;
    time: number;
    x: number;
    y: number;
}

let lastSelectingTap: TouchTap | null = null;
let lastPointerDownType: string | undefined;

/** Remember the pointer type of the latest press; older WebKit clicks are plain MouseEvents. */
export function notePointerDown(pointerType: string | undefined) {
    lastPointerDownType = pointerType;
}

/** Whether a click came from a touch tap. */
export function isTouchClick(event: MouseEvent): boolean {
    const pointerType = (event as Partial<PointerEvent>).pointerType;
    if (pointerType) return pointerType === "touch";
    return lastPointerDownType === "touch";
}

/** Record a touch tap that selected (but did not edit) a node. */
export function recordSelectingTap(uuid: string, x: number, y: number, time: number) {
    lastSelectingTap = { uuid, x, y, time };
}

/**
 * If this touch tap completes a double-tap, return the node the first tap
 * selected. Any tap consumes the pending first tap.
 */
export function takeDoubleTapTarget(x: number, y: number, time: number): string | undefined {
    const first = lastSelectingTap;
    lastSelectingTap = null;
    if (!first) return undefined;

    const elapsed = time - first.time;
    if (elapsed < 0 || elapsed > TOUCH_DOUBLE_TAP_MS) return undefined;
    if (Math.hypot(x - first.x, y - first.y) > TOUCH_DOUBLE_TAP_SLOP_PX) return undefined;
    return first.uuid;
}

/** Test hook: forget any pending first tap. */
export function resetTouchDoubleTap() {
    lastSelectingTap = null;
    lastPointerDownType = undefined;
}
