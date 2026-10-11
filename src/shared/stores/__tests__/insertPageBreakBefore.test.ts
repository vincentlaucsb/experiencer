import CssNode from '@/shared/CssTree';
import registerNodes from '@/resume/schema';
import { assignIds } from '@/shared/utils/assignIds';
import { cssStore, rootCssStore } from '../cssStoreHooks';
import { resumeNodeStore } from '../resumeNodeStore';
import { useHistoryStore } from '../historyStore';
import { canInsertPageBreakBefore, insertPageBreakBefore } from '../insertPageBreakBefore';
import buildContextMenuItems from '@/resume/schema/buildContextMenuItems';

beforeAll(() => registerNodes());
beforeEach(() => {
    resumeNodeStore.setNodes(assignIds([{ type: 'Column', childNodes: [
        { type: 'Section', value: 'Experience' }, { type: 'Section', value: 'Education' }
    ] }]));
    cssStore.setCss(new CssNode('Document', {}, 'body'));
    rootCssStore.setCss(new CssNode('Root', {}, ':root'));
    useHistoryStore.getState().clear();
});

test('inserts before the selected section and restores both node and print CSS through history', () => {
    const column = resumeNodeStore.data.childNodes[0];
    const education = column.childNodes![1];
    const menu = buildContextMenuItems(education.uuid, { selectNode: () => undefined, editNode: () => undefined });
    const action = menu.find(item => 'label' in item && item.label === 'Page break before');
    expect(action).toBeDefined();
    insertPageBreakBefore(education.uuid);
    expect(resumeNodeStore.data.childNodes[0].childNodes!.map(node => node.type))
        .toEqual(['Section', 'PageBreak', 'Section']);
    expect(resumeNodeStore.getNodeByUuid(education.uuid)?.value).toBe('Education');
    expect(cssStore.data.findNode('Page Break')?.properties.get('break-after')).toBe('page');
    expect(useHistoryStore.getState().past).toHaveLength(1);
    useHistoryStore.getState().undo();
    expect(resumeNodeStore.data.childNodes[0].childNodes).toHaveLength(2);
    expect(cssStore.data.findNode('Page Break')).toBeUndefined();
    useHistoryStore.getState().redo();
    expect(resumeNodeStore.data.childNodes[0].childNodes![1].type).toBe('PageBreak');
    expect(cssStore.data.findNode('Page Break')?.properties.get('break-after')).toBe('page');
});

test('rejects a break inside section content without history or CSS side effects', () => {
    resumeNodeStore.setNodes(assignIds([{ type: 'Section', childNodes: [{ type: 'Section', value: 'Nested' }] }]));
    const nested = resumeNodeStore.data.childNodes[0].childNodes![0];
    expect(canInsertPageBreakBefore(nested.uuid)).toBe(false);
    insertPageBreakBefore(nested.uuid);
    expect(resumeNodeStore.data.childNodes[0].childNodes).toHaveLength(1);
    expect(useHistoryStore.getState().past).toHaveLength(0);
    expect(cssStore.data.findNode('Page Break')).toBeUndefined();
});
