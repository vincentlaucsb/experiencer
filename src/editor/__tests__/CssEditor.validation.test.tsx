import CssNode from '@/shared/CssTree';
import { clearToast, useToastStore } from '@/shared/stores/toastStore';
import { createCssEditorCommands } from '@/shared/stores/cssEditorCommands';
import { cssStore } from '@/shared/stores/cssStoreHooks';
import { useHistoryStore } from '@/shared/stores/historyStore';

describe('CSS selector authoring validation', () => {
    afterEach(() => clearToast());

    test('rejects invalid declarations without changing saved CSS or undo history', () => {
        cssStore.setCss(new CssNode('Resume CSS', { 'font-size': '16px', 'font-family': 'serif' }, 'body'));
        useHistoryStore.getState().clear();
        const editor = createCssEditorCommands(cssStore.updateCss.bind(cssStore));
        editor.updateProperty([], 'font-size', 'notacolor');
        editor.updateProperty([], 'font-size', '-5px');
        editor.updateProperty([], 'font-family', 'red; } body { display:none');
        expect(cssStore.data.properties.get('font-size')).toBe('16px');
        expect(cssStore.data.properties.get('font-family')).toBe('serif');
        expect(useHistoryStore.getState().past).toHaveLength(0);
        editor.updateProperty([], 'font-size', '18px');
        expect(cssStore.data.properties.get('font-size')).toBe('18px');
        useHistoryStore.getState().undo();
        expect(cssStore.data.properties.get('font-size')).toBe('16px');
    });

    test('rejects an entire live CSS replacement before any rule or history changes', () => {
        const root = new CssNode('Resume CSS', { color: 'black' }, 'body');
        root.addNode('Entry', { color: 'black' }, '.entry');
        cssStore.setCss(root);
        useHistoryStore.getState().clear();
        const editor = createCssEditorCommands(cssStore.updateCss.bind(cssStore));
        const before = cssStore.data.dump();
        editor.replaceProperties(['red', 'red; display:none'].map((value, index) => ({
            status: 'changed', name: index ? 'Entry' : 'Resume CSS', path: index ? ['Entry'] : [],
            selector: index ? 'body .entry' : 'body', previousDeclarations: new Map([['color', 'black']]),
            declarations: new Map([['color', value]]), added: [], changed: ['color'], removed: []
        })));
        expect(cssStore.data.dump()).toEqual(before);
        expect(useHistoryStore.getState().past).toHaveLength(0);
    });

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

    test('removes a cleared declaration without an error and undo restores it', () => {
        cssStore.setCss(new CssNode('Resume CSS', {
            color: 'var(--text-color)',
            'font-size': '16px'
        }, 'body'));
        useHistoryStore.getState().clear();
        const editor = createCssEditorCommands(cssStore.updateCss.bind(cssStore));

        editor.updateProperty([], 'color', '');
        editor.updateProperty([], 'font-size', '   ');

        expect(cssStore.data.properties.has('color')).toBe(false);
        expect(cssStore.data.properties.has('font-size')).toBe(false);
        expect(cssStore.data.stylesheet()).not.toContain(': ;');
        expect(useToastStore.getState().visible).toBe(false);
        expect(useHistoryStore.getState().past).toHaveLength(2);
        useHistoryStore.getState().undo();
        expect(cssStore.data.properties.get('font-size')).toBe('16px');
        useHistoryStore.getState().undo();
        expect(cssStore.data.properties.get('color')).toBe('var(--text-color)');
    });
});
