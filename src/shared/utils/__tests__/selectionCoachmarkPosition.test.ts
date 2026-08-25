import {
    positionSelectionCoachmark,
    positionSelectionControl
} from '../selectionCoachmarkPosition';

const selected = { top: 200, right: 700, bottom: 260, left: 300 };
const resume = { top: 100, right: 720, bottom: 900, left: 100 };

test('prefers the gutter to the right of the resume', () => {
    expect(positionSelectionCoachmark(
        selected,
        resume,
        { top: 50, right: 1100, bottom: 950, left: 0 },
        240,
        48
    )).toEqual({ left: 732, top: 200, placement: 'right' });
});

test('uses the left gutter when the right gutter is too narrow', () => {
    expect(positionSelectionCoachmark(
        selected,
        { ...resume, left: 300 },
        { top: 50, right: 850, bottom: 950, left: 0 },
        240,
        48
    )).toEqual({ left: 48, top: 200, placement: 'left' });
});

test('falls back above the selection without leaving the editor pane', () => {
    expect(positionSelectionCoachmark(
        { ...selected, top: 70 },
        { ...resume, left: 20 },
        { top: 50, right: 820, bottom: 950, left: 0 },
        240,
        48
    )).toEqual({ left: 460, top: 58, placement: 'above' });
});

test('keeps selection controls above nodes with sufficient pane space', () => {
    expect(positionSelectionControl(
        selected,
        { top: 100, right: 850, bottom: 700, left: 0 },
        28,
        28
    )).toEqual({ placement: 'above', leftOffset: 374, topOffset: 0 });
});

test('moves selection controls inside the pane at its top edge', () => {
    expect(positionSelectionControl(
        { ...selected, top: 80, bottom: 260 },
        { top: 100, right: 850, bottom: 700, left: 0 },
        28,
        28
    )).toEqual({ placement: 'inside', leftOffset: 374, topOffset: 28 });
});

test('hides selection controls when their node is outside the visible pane', () => {
    expect(positionSelectionControl(
        { ...selected, top: -100, bottom: 90 },
        { top: 100, right: 850, bottom: 700, left: 0 },
        28,
        28
    )).toEqual({ placement: 'hidden', leftOffset: 0, topOffset: 0 });
});

test('clamps selection controls inside the pane right edge', () => {
    expect(positionSelectionControl(
        selected,
        { top: 100, right: 680, bottom: 700, left: 0 },
        28,
        28
    )).toEqual({ placement: 'above', leftOffset: 344, topOffset: 0 });
});
