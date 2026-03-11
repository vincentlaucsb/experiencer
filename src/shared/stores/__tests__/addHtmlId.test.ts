import addHtmlId from '../addHtmlId';
import CssNode from '@/shared/CssTree';
import { assignIds } from '@/shared/utils/assignIds';
import { useEditorStore } from '@/shared/stores/editorStore';
import { useHistoryStore } from '@/shared/stores/historyStore';
import { cssStore } from '@/shared/stores/cssStoreHooks';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { BasicResumeNode } from '@/types';

describe('addHtmlId', () => {
    beforeEach(() => {
        resumeNodeStore.setNodes([]);
        cssStore.setCss(new CssNode('Resume CSS', {}, '#resume'));
        useEditorStore.setState({ selectedNodeId: undefined, isEditingSelected: false });
        useHistoryStore.getState().clear();
    });

    test('clearing an existing ID removes the node htmlId and matching CSS subtree', () => {
        const [node] = assignIds([
            { type: 'Section', htmlId: 'page-two' }
        ] as BasicResumeNode[]);

        resumeNodeStore.setNodes([node]);
        useEditorStore.getState().selectNode(node.uuid);
        cssStore.updateCss((css) => {
            css.addNode(new CssNode('#page-two', { color: 'red' }, '#page-two'));
        });

        addHtmlId('');

        const updatedNode = resumeNodeStore.data.getNodeByUuid(node.uuid);
        expect(updatedNode?.htmlId).toBeUndefined();
        expect(cssStore.data.findNode(['#page-two'])).toBeUndefined();
        expect(cssStore.data.findNode(['#'])).toBeUndefined();
    });
});