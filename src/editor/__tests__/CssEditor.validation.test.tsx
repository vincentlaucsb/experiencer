import CssNode from '@/shared/CssTree';
import { clearToast, useToastStore } from '@/shared/stores/toastStore';
import { createCssEditorCommands } from '@/shared/stores/cssEditorCommands';
import { cssStore } from '@/shared/stores/cssStoreHooks';
import { useHistoryStore } from '@/shared/stores/historyStore';

describe('CSS selector authoring validation', () => {
    afterEach(() => clearToast());

    test.each(['#resume', '#resume .entry', '.entry:is(#resume .nested)'])(
        'rejects reserved selector %s with a toast before mutation',
        (selector) => {
            const tree = new CssNode('Resume CSS', {}, 'body');
            const updateTree = jest.fn((updater: (root: CssNode) => void) => updater(tree));
            const editor = createCssEditorCommands(updateTree);

            editor.addSelector([], 'Invalid', selector);

            expect(updateTree).not.toHaveBeenCalled();
            expect(tree.children).toHaveLength(0);
            expect(useToastStore.getState()).toMatchObject({
                visible: true,
                message: '#resume is reserved for Experiencer\'s editor host.'
            });
        }
    );

    test('rejects selector edits without replacing the existing selector', () => {
        const tree = new CssNode('Resume CSS', {}, 'body');
        const updateTree = jest.fn((updater: (root: CssNode) => void) => updater(tree));
        const editor = createCssEditorCommands(updateTree);

        editor.updateSelector([], '#resume .entry');

        expect(updateTree).not.toHaveBeenCalled();
        expect(tree.selector).toBe('body');
        expect(useToastStore.getState().visible).toBe(true);
    });

    test('accepts ordinary selectors', () => {
        const tree = new CssNode('Resume CSS', {}, 'body');
        const updateTree = jest.fn((updater: (root: CssNode) => void) => updater(tree));
        const editor = createCssEditorCommands(updateTree);

        editor.addSelector([], 'Entry', '.entry');

        expect(updateTree).toHaveBeenCalledTimes(1);
        expect(tree.children[0].selector).toBe('.entry');
        expect(useToastStore.getState().visible).toBe(false);
    });

    test('does not create undo history for selector rejection', () => {
        cssStore.setCss(new CssNode('Resume CSS', {}, 'body'));
        useHistoryStore.getState().clear();
        const editor = createCssEditorCommands(cssStore.updateCss.bind(cssStore));

        editor.addSelector([], 'Invalid', '#resume');
        editor.updateSelector([], '#resume .entry');

        expect(useHistoryStore.getState().past).toHaveLength(0);
        expect(cssStore.data.children).toHaveLength(0);
        expect(cssStore.data.selector).toBe('body');
    });
});
