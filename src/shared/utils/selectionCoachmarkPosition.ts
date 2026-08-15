export type CoachmarkPlacement = 'right' | 'left' | 'above';

export interface RectBounds {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export interface CoachmarkPosition {
    left: number;
    top: number;
    placement: CoachmarkPlacement;
}

const edgePadding = 8;
const pageGap = 12;

function clamp(value: number, minimum: number, maximum: number): number {
    return Math.min(Math.max(value, minimum), Math.max(minimum, maximum));
}

/** Positions onboarding help in the editor gutter without covering resume content. */
export function positionSelectionCoachmark(
    selected: RectBounds,
    resume: RectBounds,
    editorPane: RectBounds,
    coachmarkWidth: number,
    coachmarkHeight: number
): CoachmarkPosition {
    const minimumLeft = editorPane.left + edgePadding;
    const maximumLeft = editorPane.right - coachmarkWidth - edgePadding;
    const top = clamp(
        selected.top,
        editorPane.top + edgePadding,
        editorPane.bottom - coachmarkHeight - edgePadding
    );

    if (editorPane.right - resume.right >= coachmarkWidth + pageGap + edgePadding) {
        return {
            left: resume.right + pageGap,
            top,
            placement: 'right'
        };
    }

    if (resume.left - editorPane.left >= coachmarkWidth + pageGap + edgePadding) {
        return {
            left: resume.left - coachmarkWidth - pageGap,
            top,
            placement: 'left'
        };
    }

    return {
        left: clamp(selected.right - coachmarkWidth, minimumLeft, maximumLeft),
        top: clamp(
            selected.top - coachmarkHeight - pageGap,
            editorPane.top + edgePadding,
            editorPane.bottom - coachmarkHeight - edgePadding
        ),
        placement: 'above'
    };
}
