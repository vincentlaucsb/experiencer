import registerNodes from '@/resume/schema';
import buildContextMenuItems from '@/resume/schema/buildContextMenuItems';
import { resumeNodeStore } from '../resumeNodeStore';
import { resumeAppExtensionsStore } from '../resumeAppExtensionsStore';

beforeAll(() => registerNodes());
afterEach(() => resumeAppExtensionsStore.replace({}));

test('context menus may navigate while selection menus keep the default action', () => {
    resumeNodeStore.setNodes([{ type: 'Entry', uuid: 'entry', title: ['Example'] }]);
    let outcome = '';
    resumeAppExtensionsStore.replace({ editor: { nodeActions: () => [{
        id: 'inspect', label: 'Inspect', run: () => { outcome = 'default'; },
        runFromContextMenu: () => { outcome = 'context'; }
    }] } });
    const actions = { selectNode: () => undefined, editNode: () => undefined };
    const invoke = (source: 'context-menu' | 'selection-menu') => {
        const item = buildContextMenuItems('entry', actions, source).find(item => 'id' in item && item.id === 'inspect');
        if (item && 'onSelect' in item) item.onSelect?.({ id: 'inspect', item, nativeEvent: new Event('click'), context: {}, close: () => undefined, preventClose: () => undefined });
    };
    invoke('context-menu'); expect(outcome).toBe('context');
    invoke('selection-menu'); expect(outcome).toBe('default');
    resumeAppExtensionsStore.replace({ editor: { nodeActions: () => [{
        id: 'inspect', label: 'Inspect', run: () => { outcome = 'fallback'; }
    }] } });
    invoke('context-menu'); expect(outcome).toBe('fallback');
});
