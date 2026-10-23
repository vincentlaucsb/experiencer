export interface RectBounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export type SelectionControlPlacement = 'above' | 'inside' | 'hidden';

export interface SelectionControlPosition {
    placement: SelectionControlPlacement;
    leftOffset: number;
    topOffset: number;
}

const edgePadding = 8;

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

/** Keeps a selected-node control above its outline when possible and inside the visible pane near edges. */
export function positionSelectionControl(
    selected: RectBounds,
    editorPane: RectBounds,
    controlWidth: number,
    controlHeight: number
): SelectionControlPosition {
    if (selected.bottom <= editorPane.top || selected.top >= editorPane.bottom) {
        return { placement: 'hidden', leftOffset: 0, topOffset: 0 };
    }

    const leftOffset = clamp(
        selected.right - controlWidth + 2,
        editorPane.left + edgePadding,
        editorPane.right - controlWidth - edgePadding
    ) - selected.left;

    if (selected.top - controlHeight - edgePadding >= editorPane.top) {
        return { placement: 'above', leftOffset, topOffset: 0 };
    }

    return {
        placement: 'inside',
        leftOffset,
        topOffset: clamp(
            editorPane.top + edgePadding - selected.top,
            0,
            editorPane.bottom - controlHeight - edgePadding - selected.top
        )
    };
}
