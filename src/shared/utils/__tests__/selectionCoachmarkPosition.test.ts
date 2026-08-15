import { positionSelectionCoachmark } from '../selectionCoachmarkPosition';

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
