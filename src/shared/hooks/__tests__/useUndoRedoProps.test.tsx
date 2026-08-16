import { act, renderHook } from '@testing-library/react';
import CssNode from '@/shared/CssTree';
import useUndoRedoProps from '@/shared/hooks/useUndoRedoProps';
import { cssStore } from '@/shared/stores/cssStoreHooks';
import { useHistoryStore } from '@/shared/stores/historyStore';

test('reacts to CSS-only undo and redo availability', () => {
    cssStore.setCss(new CssNode('Resume CSS', {}, 'body'));
    useHistoryStore.getState().clear();
    const { result } = renderHook(() => useUndoRedoProps());

    expect(result.current.undo).toBeUndefined();
    expect(result.current.redo).toBeUndefined();

    act(() => {
        cssStore.updateCss((css) => css.properties.set('color', 'red'));
    });
    expect(result.current.undo).toBeDefined();

    act(() => result.current.undo?.());
    expect(result.current.undo).toBeUndefined();
    expect(result.current.redo).toBeDefined();

    act(() => result.current.redo?.());
    expect(result.current.undo).toBeDefined();
    expect(result.current.redo).toBeUndefined();
});
