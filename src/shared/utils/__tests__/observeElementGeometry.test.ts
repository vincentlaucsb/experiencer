/** @jest-environment jsdom */
import { observeElementGeometry, type ElementGeometry } from '../observeElementGeometry';

test('coalesces real sibling mutations and cancels pending observations on disposal', async () => {
    const root = document.createElement('div');
    const note = document.createElement('div');
    const anchor = document.createElement('div');
    root.append(note, anchor);
    document.body.append(root);
    const snapshots: ElementGeometry[] = [];
    let nextFrame: FrameRequestCallback | undefined;
    const request = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(callback => {
        nextFrame = callback;
        return 17;
    });
    const cancel = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const bounds = jest.spyOn(anchor, 'getBoundingClientRect')
        .mockReturnValue(new DOMRect(0, 100, 200, 40));
    const dispose = observeElementGeometry(anchor, root, snapshot => snapshots.push(snapshot));

    try {
        expect(snapshots).toHaveLength(1);
        expect(snapshots[0].bounds.top).toBe(100);
        bounds.mockReturnValue(new DOMRect(0, 50, 200, 40));
        note.remove();
        await Promise.resolve();
        window.dispatchEvent(new Event('resize'));
        expect(request).toHaveBeenCalledTimes(1);
        nextFrame!(0);
        expect(snapshots).toHaveLength(2);
        expect(snapshots[1].bounds.top).toBe(50);

        root.append(note);
        await Promise.resolve();
        expect(request).toHaveBeenCalledTimes(2);
        dispose();
        expect(cancel).toHaveBeenCalledWith(17);
        nextFrame!(0);
        expect(snapshots).toHaveLength(2);
        window.dispatchEvent(new Event('resize'));
        expect(request).toHaveBeenCalledTimes(2);
    } finally {
        dispose();
        root.remove();
        request.mockRestore();
        cancel.mockRestore();
        bounds.mockRestore();
    }
});
