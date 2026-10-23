import { positionSelectionControl } from '../selectionControlPosition';

const selected = { top: 200, right: 700, bottom: 260, left: 300 };

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
