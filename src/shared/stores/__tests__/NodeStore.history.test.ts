import registerNodes from '@/resume/schema';
import NodeStore from '@/shared/stores/NodeStore';
import { resumeNodeStore } from '@/shared/stores/resumeNodeStore';
import { useHistoryStore } from '@/shared/stores/historyStore';
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

    test('updateNode history preserves the committed value when an array was mutated before the call', () => {
        const store = makeStore([
            {
                type: 'Section',
                childNodes: [{ type: 'Entry', subtitle: ['Original', 'City'] }],
            },
        ]);

        const entry = store.data.childNodes[0].childNodes?.[0];
        if (!entry) throw new Error('Expected Entry node');

        const subtitle = entry.subtitle as string[];
        subtitle[0] = 'Changed';
        store.updateNode(entry.uuid, 'subtitle', subtitle);

        const snapshot = mockRecordHistory.mock.calls[0][0] as ResumeNode[];
        expect(snapshot[0].childNodes?.[0]?.subtitle).toEqual(['Original', 'City']);
        expect(store.getNodeByUuid(entry.uuid)?.subtitle).toEqual(['Changed', 'City']);
    });

    test('updateNode history preserves deleted fields when an array was mutated before the call', () => {
        const store = makeStore([
            {
                type: 'Section',
                childNodes: [{ type: 'Entry', subtitle: ['Original', 'City'] }],
            },
        ]);

        const entry = store.data.childNodes[0].childNodes?.[0];
        if (!entry) throw new Error('Expected Entry node');

        const subtitle = entry.subtitle as string[];
        subtitle.splice(0, 1);
        store.updateNode(entry.uuid, 'subtitle', subtitle);

        const snapshot = mockRecordHistory.mock.calls[0][0] as ResumeNode[];
        expect(snapshot[0].childNodes?.[0]?.subtitle).toEqual(['Original', 'City']);
        expect(store.getNodeByUuid(entry.uuid)?.subtitle).toEqual(['City']);
    });

    test('undo restores Entry subtitle edits and deletions through the live history store', () => {
        useHistoryStore.getState().clear();
        resumeNodeStore.setNodes(assignIds([
            {
                type: 'Section',
                childNodes: [{ type: 'Entry', subtitle: ['Original', 'City'] }],
            },
        ] as BasicResumeNode[]) as ResumeNode[]);

        const entry = resumeNodeStore.data.childNodes[0].childNodes?.[0];
        if (!entry) throw new Error('Expected Entry node');

        const editedSubtitle = entry.subtitle as string[];
        editedSubtitle[0] = 'Changed';
        resumeNodeStore.updateNode(entry.uuid, 'subtitle', editedSubtitle);
        useHistoryStore.getState().undo();

        const restoredEntry = resumeNodeStore.data.childNodes[0].childNodes?.[0];
        expect(restoredEntry?.subtitle).toEqual(['Original', 'City']);

        const deletedSubtitle = restoredEntry?.subtitle as string[];
        deletedSubtitle.splice(0, 1);
        resumeNodeStore.updateNode(restoredEntry!.uuid, 'subtitle', deletedSubtitle);
        useHistoryStore.getState().undo();

        expect(resumeNodeStore.data.childNodes[0].childNodes?.[0]?.subtitle)
            .toEqual(['Original', 'City']);
        useHistoryStore.getState().clear();
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

    test('duplicateNode inserts a fresh-ID sibling and records one history entry', () => {
        const store = makeStore([
            {
                type: 'Section',
                childNodes: [
                    {
                        type: 'Entry',
                        title: ['Original'],
                        childNodes: [{ type: 'Markdown', value: 'Nested content' }]
                    },
                    { type: 'Entry', title: ['Following'] }
                ]
            }
        ]);

        const section = store.data.childNodes[0];
        const original = section.childNodes?.[0];
        if (!original) {
            throw new Error('Expected original entry');
        }

        const duplicateUuid = store.duplicateNode(original.uuid, false);
        const duplicate = section.childNodes?.[1];

        expect(mockRecordHistory).toHaveBeenCalledTimes(1);
        expect(duplicateUuid).toBe(duplicate?.uuid);
        expect(duplicate?.title).toEqual(['Original']);
        expect(duplicate?.uuid).not.toBe(original.uuid);
        expect(duplicate?.childNodes?.[0]?.uuid).not.toBe(original.childNodes?.[0]?.uuid);
        expect(section.childNodes?.[2]?.title).toEqual(['Following']);
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
