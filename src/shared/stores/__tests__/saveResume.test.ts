import { dump } from '../saveResume';
import { resumeNodeStore } from '../resumeNodeStore';
import { cssStore, rootCssStore } from '../cssStoreHooks';
import { assignIds } from '@/shared/utils/assignIds';
import CssNode from '@/shared/CssTree';
import { BasicResumeNode, ResumeNode } from '@/types';

function hasNoUuids(nodes: BasicResumeNode[]): boolean {
    return nodes.every((node) => {
        if ('uuid' in node) return false;
        if (node.childNodes) return hasNoUuids(node.childNodes);
        return true;
    });
}

beforeEach(() => {
    resumeNodeStore.setNodes([]);
    cssStore.setCss(new CssNode('Resume CSS', {}, '#resume'));
    rootCssStore.setCss(new CssNode(':root', {}, ':root'));
});

describe('dump()', () => {
    test('returns empty childNodes when tree is empty', () => {
        const result = dump();
        expect(result.childNodes).toEqual([]);
    });

    test('strips uuid from top-level nodes', () => {
        const nodes: ResumeNode[] = assignIds([
            { type: 'Section', value: 'Experience' },
        ] as BasicResumeNode[]);
        resumeNodeStore.setNodes(nodes);

        const result = dump();

        expect(result.childNodes).toHaveLength(1);
        expect('uuid' in result.childNodes[0]).toBe(false);
    });

    test('strips uuid from nested nodes recursively', () => {
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

        expect(hasNoUuids(result.childNodes)).toBe(true);
    });

    test('preserves all non-uuid node properties', () => {
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
            css.add('Section', { 'font-size': '14pt' });
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
});
