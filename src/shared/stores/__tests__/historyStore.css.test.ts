import CssNode from '@/shared/CssTree';
import registerNodes from '@/resume/schema';
import ComponentTypes from '@/resume/schema/ComponentTypes';
import PageBreak from '@/resume/PageBreak';
import { assignIds } from '@/shared/utils/assignIds';
import addNodeAndEnsureCss from '@/shared/stores/addNodeAndEnsureCss';
import applyScopedLiveCssChanges from '@/shared/stores/applyScopedLiveCssChanges';
import { cssStore, rootCssStore } from '@/shared/stores/cssStoreHooks';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import {
    runHistoryTransaction,
    useHistoryStore
} from '@/shared/stores/historyStore';
import { ScopedLiveCssTreeChange } from '@/shared/utils/liveCssBaseline';
import { BasicResumeNode, ResumeNode } from '@/types';

function cssChange(
    tree: 'resume' | 'root',
    declarations: ReadonlyMap<string, string>
): ScopedLiveCssTreeChange {
    return {
        tree,
        name: tree,
        path: [],
        selector: tree === 'root' ? ':root' : 'body',
        status: 'changed',
        declarations,
        previousDeclarations: new Map(),
        added: Array.from(declarations.keys()),
        changed: [],
        removed: [],
    };
}

describe('CSS-aware history', () => {
    beforeAll(() => {
        registerNodes();
    });

    beforeEach(() => {
        resumeNodeStore.setNodes(assignIds([
            { type: 'Section', value: 'Original' },
        ] as BasicResumeNode[]) as ResumeNode[]);
        cssStore.setCss(new CssNode('Resume CSS', {}, 'body'));
        rootCssStore.setCss(new CssNode(':root', {}, ':root'));
        useHistoryStore.getState().clear();
    });

    test('undoes and redoes resume CSS without replacing unrelated stores', () => {
        const originalNodes = resumeNodeStore.data;
        const originalRootCss = rootCssStore.data;

        cssStore.updateCss((css) => css.properties.set('color', 'red'));

        expect(useHistoryStore.getState().past).toHaveLength(1);
        expect(cssStore.data.properties.get('color')).toBe('red');

        useHistoryStore.getState().undo();

        expect(cssStore.data.properties.has('color')).toBe(false);
        expect(resumeNodeStore.data).toBe(originalNodes);
        expect(rootCssStore.data).toBe(originalRootCss);

        useHistoryStore.getState().redo();

        expect(cssStore.data.properties.get('color')).toBe('red');
    });

    test('undoes and redoes root CSS changes', () => {
        rootCssStore.updateCss((css) => css.properties.set('--accent', '#123456'));

        useHistoryStore.getState().undo();
        expect(rootCssStore.data.properties.has('--accent')).toBe(false);

        useHistoryStore.getState().redo();
        expect(rootCssStore.data.properties.get('--accent')).toBe('#123456');
    });

    test('preserves chronological order across node and both CSS stores', () => {
        const sectionUuid = resumeNodeStore.data.childNodes[0].uuid;
        resumeNodeStore.updateNode(sectionUuid, 'value', 'Changed');
        cssStore.updateCss((css) => css.properties.set('color', 'red'));
        rootCssStore.updateCss((css) => css.properties.set('--accent', 'blue'));

        useHistoryStore.getState().undo();
        expect(rootCssStore.data.properties.has('--accent')).toBe(false);
        expect(cssStore.data.properties.get('color')).toBe('red');
        expect(resumeNodeStore.getNodeByUuid(sectionUuid)?.value).toBe('Changed');

        useHistoryStore.getState().undo();
        expect(cssStore.data.properties.has('color')).toBe(false);
        expect(resumeNodeStore.getNodeByUuid(sectionUuid)?.value).toBe('Changed');

        useHistoryStore.getState().undo();
        expect(resumeNodeStore.getNodeByUuid(sectionUuid)?.value).toBe('Original');

        useHistoryStore.getState().redo();
        useHistoryStore.getState().redo();
        useHistoryStore.getState().redo();
        expect(resumeNodeStore.getNodeByUuid(sectionUuid)?.value).toBe('Changed');
        expect(cssStore.data.properties.get('color')).toBe('red');
        expect(rootCssStore.data.properties.get('--accent')).toBe('blue');
    });

    test('keeps the true committed CSS baseline when a live reference changed early', () => {
        cssStore.data.properties.set('color', 'red');
        cssStore.updateCss((css) => css.properties.set('margin', '1rem'));

        useHistoryStore.getState().undo();

        expect(cssStore.data.properties.size).toBe(0);
    });

    test('groups repeated and cross-store CSS mutations into one transaction', () => {
        runHistoryTransaction(() => {
            cssStore.updateCss((css) => css.properties.set('color', 'red'));
            cssStore.updateCss((css) => css.properties.set('color', 'blue'));
            rootCssStore.updateCss((css) => css.properties.set('--accent', 'orange'));
        });

        expect(useHistoryStore.getState().past).toHaveLength(1);
        useHistoryStore.getState().undo();
        expect(cssStore.data.properties.has('color')).toBe(false);
        expect(rootCssStore.data.properties.has('--accent')).toBe(false);

        useHistoryStore.getState().redo();
        expect(cssStore.data.properties.get('color')).toBe('blue');
        expect(rootCssStore.data.properties.get('--accent')).toBe('orange');
    });

    test('imports live changes across both CSS trees as one action', () => {
        applyScopedLiveCssChanges([
            cssChange('root', new Map([['--accent', 'purple']])),
            cssChange('resume', new Map([['color', 'purple']])),
        ]);

        expect(useHistoryStore.getState().past).toHaveLength(1);
        useHistoryStore.getState().undo();
        expect(rootCssStore.data.properties.has('--accent')).toBe(false);
        expect(cssStore.data.properties.has('color')).toBe(false);

        useHistoryStore.getState().redo();
        expect(rootCssStore.data.properties.get('--accent')).toBe('purple');
        expect(cssStore.data.properties.get('color')).toBe('purple');
    });

    test('inserts a node and seeds its CSS in one history entry', () => {
        resumeNodeStore.setNodes([]);
        const pageBreak = assignIds(
            ComponentTypes.instance.defaultValue(PageBreak.type).node
        ) as ResumeNode;

        addNodeAndEnsureCss(
            (parentUuid, node) => resumeNodeStore.addNode(parentUuid, node),
            undefined,
            pageBreak
        );

        expect(useHistoryStore.getState().past).toHaveLength(1);
        expect(resumeNodeStore.data.childNodes).toHaveLength(1);
        expect(cssStore.data.findNode(['Page Break'])).toBeDefined();

        useHistoryStore.getState().undo();
        expect(resumeNodeStore.data.childNodes).toHaveLength(0);
        expect(cssStore.data.findNode(['Page Break'])).toBeUndefined();

        useHistoryStore.getState().redo();
        expect(resumeNodeStore.data.childNodes).toHaveLength(1);
        expect(cssStore.data.findNode(['Page Break'])).toBeDefined();
    });

    test('replacement and hydration APIs do not create history', () => {
        cssStore.setCss(new CssNode('Replacement', { color: 'red' }, 'body'));
        rootCssStore.loadCss(new CssNode(':root', { '--accent': 'red' }, ':root').dump());

        expect(useHistoryStore.getState().past).toHaveLength(0);
    });

    test('clears redo on a new CSS edit and shares the 50-action limit', () => {
        cssStore.updateCss((css) => css.properties.set('color', 'red'));
        useHistoryStore.getState().undo();
        expect(useHistoryStore.getState().future).toHaveLength(1);

        rootCssStore.updateCss((css) => css.properties.set('--accent', 'blue'));
        expect(useHistoryStore.getState().future).toHaveLength(0);

        for (let index = 0; index < 55; index += 1) {
            cssStore.updateCss((css) => css.properties.set('order', String(index)));
        }
        expect(useHistoryStore.getState().past).toHaveLength(50);
    });
});
