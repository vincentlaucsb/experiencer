import registerNodes from '@/resume/schema';
import NodeStore from '@/shared/stores/NodeStore';
import { assignIds } from '@/shared/utils/assignIds';
import { BasicResumeNode, ResumeNode } from '@/types';

const mockRecordHistory = jest.fn();

function makeStore(nodes: BasicResumeNode[]): NodeStore {
    const assigned = assignIds(nodes) as ResumeNode[];
    const store = new NodeStore();
    store.setHistoryRecorder(mockRecordHistory);
    store.setNodes(assigned);
    return store;
}

describe('NodeStore history recording', () => {
    let selectedNodeId: string | undefined;
    const mockClearSelection = jest.fn(() => {
        selectedNodeId = undefined;
    });

    beforeAll(() => {
        registerNodes();
    });

    beforeEach(() => {
        mockRecordHistory.mockClear();
        mockClearSelection.mockClear();
        selectedNodeId = undefined;
    });

    test('updateNode records history once', () => {
        const store = makeStore([
            { type: 'Section', childNodes: [{ type: 'Markdown', value: 'hello' }] },
        ]);

        const section = store.data.childNodes[0];
        store.updateNode(section.uuid, 'textAlign', 'center');

        expect(mockRecordHistory).toHaveBeenCalledTimes(1);
    });

    test('updateNodeFields records history once for multiple fields', () => {
        const store = makeStore([
            { type: 'Section', childNodes: [{ type: 'Markdown', value: 'hello' }] },
        ]);

        const section = store.data.childNodes[0];
        store.updateNodeFields(section.uuid, {
            textAlign: 'left',
            classNames: 'my-section',
        });

        expect(mockRecordHistory).toHaveBeenCalledTimes(1);
        expect(store.getNodeByUuid(section.uuid)?.textAlign).toBe('left');
        expect(store.getNodeByUuid(section.uuid)?.classNames).toBe('my-section');
    });

    test('updateNodeFields does not record history for empty patch', () => {
        const store = makeStore([
            { type: 'Section', childNodes: [{ type: 'Markdown', value: 'hello' }] },
        ]);

        const section = store.data.childNodes[0];
        store.updateNodeFields(section.uuid, { classNames: undefined });

        expect(mockRecordHistory).not.toHaveBeenCalled();
    });

    test('deleteNode records history once', () => {
        const store = makeStore([
            { type: 'Section', childNodes: [{ type: 'Markdown', value: 'hello' }] },
        ]);

        const section = store.data.childNodes[0];
        store.deleteNode(section.uuid);

        expect(mockRecordHistory).toHaveBeenCalledTimes(1);
    });

    test('moveNodeUp and moveNodeDown each record history once', () => {
        const store = makeStore([
            { type: 'Section' },
            { type: 'Section' },
        ]);

        const firstUuid = store.data.childNodes[0].uuid;
        const secondUuid = store.data.childNodes[1].uuid;

        store.moveNodeDown(firstUuid);
        store.moveNodeUp(secondUuid);

        expect(mockRecordHistory).toHaveBeenCalledTimes(2);
    });

    test('addNode records history for valid insert', () => {
        const store = makeStore([
            { type: 'Section', childNodes: [] },
        ]);

        const parentUuid = store.data.childNodes[0].uuid;
        const child = assignIds({ type: 'Markdown', value: 'child' } as BasicResumeNode) as ResumeNode;

        store.addNode(parentUuid, child);

        expect(mockRecordHistory).toHaveBeenCalledTimes(1);
    });

    test('addNode does not record history for invalid insert', () => {
        const store = makeStore([
            { type: 'Markdown', value: 'parent markdown' },
        ]);

        const parentUuid = store.data.childNodes[0].uuid;
        const invalidChild = assignIds({ type: 'Section' } as BasicResumeNode) as ResumeNode;

        store.addNode(parentUuid, invalidChild);

        expect(mockRecordHistory).not.toHaveBeenCalled();
    });

    test('deleteNode clears selection when deleted node is selected', () => {
        const store = makeStore([
            { type: 'Section', childNodes: [{ type: 'Markdown', value: 'hello' }] },
        ]);

        const targetUuid = store.data.childNodes[0].uuid;
        selectedNodeId = targetUuid;
        store.setSelectionAdapter(() => selectedNodeId, mockClearSelection);

        store.deleteNode(targetUuid);

        expect(mockClearSelection).toHaveBeenCalledTimes(1);
        expect(selectedNodeId).toBeUndefined();
    });

    test('deleteNode clears selection when selected node is inside deleted subtree', () => {
        const store = makeStore([
            {
                type: 'Section',
                childNodes: [
                    {
                        type: 'Group',
                        childNodes: [{ type: 'Markdown', value: 'nested' }]
                    }
                ]
            },
        ]);

        const parentUuid = store.data.childNodes[0].uuid;
        const nestedSelectedUuid = store.data.childNodes[0].childNodes?.[0].childNodes?.[0].uuid;
        selectedNodeId = nestedSelectedUuid;
        store.setSelectionAdapter(() => selectedNodeId, mockClearSelection);

        store.deleteNode(parentUuid);

        expect(mockClearSelection).toHaveBeenCalledTimes(1);
        expect(selectedNodeId).toBeUndefined();
    });

    test('deleteNode does not clear selection for unrelated node', () => {
        const store = makeStore([
            { type: 'Section' },
            { type: 'Section' },
        ]);

        const deletingUuid = store.data.childNodes[0].uuid;
        const selectedUuid = store.data.childNodes[1].uuid;
        selectedNodeId = selectedUuid;
        store.setSelectionAdapter(() => selectedNodeId, mockClearSelection);

        store.deleteNode(deletingUuid);

        expect(mockClearSelection).not.toHaveBeenCalled();
        expect(selectedNodeId).toBe(selectedUuid);
    });
});
