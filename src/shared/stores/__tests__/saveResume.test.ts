import { dump } from '../saveResume';
import { resumeNodeStore } from '../resumeNodeStore';
import { cssStore, rootCssStore } from '../cssStoreHooks';
import { assignIds } from '@/shared/utils/assignIds';
import CssNode from '@/shared/CssTree';
import { BasicResumeNode, ResumeNode } from '@/types';
import PageSize from '@/types/PageSize';
import { useEditorStore } from '../editorStore';

beforeEach(() => {
    resumeNodeStore.setNodes([]);
    cssStore.setCss(new CssNode('Resume CSS', {}, 'body'));
    rootCssStore.setCss(new CssNode(':root', {}, ':root'));
    useEditorStore.getState().loadPageSize(PageSize.Letter);
});

describe('dump()', () => {
    test('returns empty childNodes when tree is empty', () => {
        const result = dump();
        expect(result.childNodes).toEqual([]);
    });

    test('preserves uuid on top-level nodes', () => {
        const nodes: ResumeNode[] = assignIds([
            { type: 'Section', value: 'Experience' },
        ] as BasicResumeNode[]);
        resumeNodeStore.setNodes(nodes);

        const result = dump();

        expect(result.childNodes).toHaveLength(1);
        expect(result.childNodes[0].uuid).toBe(nodes[0].uuid);
    });

    test('preserves uuid on nested nodes recursively', () => {
        const nodes: ResumeNode[] = assignIds([
            {
                type: 'Section',
                value: 'Experience',
                childNodes: [
                    { type: 'Entry', value: 'Job A' },
                    {
                        type: 'Entry',
                        value: 'Job B',
                        childNodes: [{ type: 'RichText', value: 'Did things' }],
                    },
                ],
            },
        ] as BasicResumeNode[]);
        resumeNodeStore.setNodes(nodes);

        const result = dump();

        expect(result.childNodes[0].uuid).toBe(nodes[0].uuid);
        expect(result.childNodes[0].childNodes?.[0].uuid).toBe(nodes[0].childNodes?.[0].uuid);
        expect(result.childNodes[0].childNodes?.[1].childNodes?.[0].uuid)
            .toBe(nodes[0].childNodes?.[1].childNodes?.[0].uuid);
    });

    test('preserves all node properties', () => {
        const nodes: ResumeNode[] = assignIds([
            { type: 'Section', value: 'Skills', htmlId: 'skills', classNames: 'highlight' },
        ] as BasicResumeNode[]);
        resumeNodeStore.setNodes(nodes);

        const result = dump();
        const node = result.childNodes[0];

        expect(node.type).toBe('Section');
        expect(node.value).toBe('Skills');
        expect(node.htmlId).toBe('skills');
        expect(node.classNames).toBe('highlight');
    });

    test('does not mutate the original nodes in the store', () => {
        const nodes: ResumeNode[] = assignIds([
            { type: 'Section', value: 'Education' },
        ] as BasicResumeNode[]);
        resumeNodeStore.setNodes(nodes);

        const originalUuid = resumeNodeStore.data.childNodes[0].uuid;
        dump();

        expect(resumeNodeStore.data.childNodes[0].uuid).toBe(originalUuid);
    });

    test('includes CSS dump from cssStore', () => {
        cssStore.updateCss((css) => {
            css.addNode('Section', { 'font-size': '14pt' });
        });

        const result = dump();

        expect(result.builtinCss).toBeDefined();
        expect(result.builtinCss.name).toBe('Resume CSS');
    });

    test('includes CSS dump from rootCssStore', () => {
        rootCssStore.updateCss((css) => {
            css.properties.set('--accent', '#336699');
        });

        const result = dump();

        expect(result.rootCss).toBeDefined();
        expect(result.rootCss.name).toBe(':root');
    });

    test('loading IDs preserves persisted identities and fills only missing descendants', () => {
        const persistedId = '10000000-0000-0000-0000-000000000001';
        const nodes = assignIds([{
            type: 'Section',
            uuid: persistedId,
            childNodes: [{ type: 'Markdown', value: 'New child' }]
        }] as BasicResumeNode[]);

        expect(nodes[0].uuid).toBe(persistedId);
        expect(nodes[0].childNodes?.[0].uuid).toBeTruthy();
        expect(nodes[0].childNodes?.[0].uuid).not.toBe(persistedId);
    });

    test('includes the active physical page size', () => {
        useEditorStore.getState().setPageSize(PageSize.A4);

        expect(dump().pageSize).toBe(PageSize.A4);
    });
});
