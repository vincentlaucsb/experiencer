import ResumeNodeTree from "..";
import { assignIds } from "@/shared/utils/Helpers";
import { BasicResumeNode } from "@/types";

test('getNodeById Test', () => {
    const resumeData = [{
        type: 'Row',
        childNodes: [
            { type: 'Column' },
            { type: 'Column' }
        ]
    }] as BasicResumeNode[];
    
    const data = new ResumeNodeTree(assignIds(resumeData));
    const topNode = data.getNodeById([0]);

    expect(resumeData[0].type).toBe(topNode.type);
    expect(resumeData[0].childNodes).toBeDefined();

    if (resumeData[0].childNodes) {
        expect(resumeData[0].childNodes[1].type).toBe(
            data.getNodeById([0, 1]).type
        );
    }
});

describe('UUID Index', () => {
    test('builds index on construction', () => {
        const resumeData = [{
            type: 'Section',
            value: 'Test',
            childNodes: [
                { type: 'Entry', value: 'Item 1' },
                { type: 'Entry', value: 'Item 2' }
            ]
        }] as BasicResumeNode[];
        
        const tree = new ResumeNodeTree(assignIds(resumeData));
        const section = tree.getNodeById([0]);
        
        // Should be able to get node by UUID
        expect(tree.getNodeByUuid(section.uuid)).toBe(section);
        
        // Should work for nested nodes
        if (section.childNodes) {
            const entry1 = section.childNodes[0];
            const entry2 = section.childNodes[1];
            expect(tree.getNodeByUuid(entry1.uuid)).toBe(entry1);
            expect(tree.getNodeByUuid(entry2.uuid)).toBe(entry2);
        }
    });

    test('getHierarchicalId returns correct path', () => {
        const resumeData = [{
            type: 'Row',
            childNodes: [
                { type: 'Column', childNodes: [{ type: 'Entry' }] },
                { type: 'Column' }
            ]
        }] as BasicResumeNode[];
        
        const tree = new ResumeNodeTree(assignIds(resumeData));
        const row = tree.getNodeById([0]);
        const col1 = tree.getNodeById([0, 0]);
        const entry = tree.getNodeById([0, 0, 0]);
        const col2 = tree.getNodeById([0, 1]);
        
        expect(tree.getHierarchicalId(row.uuid)).toEqual([0]);
        expect(tree.getHierarchicalId(col1.uuid)).toEqual([0, 0]);
        expect(tree.getHierarchicalId(entry.uuid)).toEqual([0, 0, 0]);
        expect(tree.getHierarchicalId(col2.uuid)).toEqual([0, 1]);
    });

    test('getHierarchicalId returns undefined for non-existent UUID', () => {
        const tree = new ResumeNodeTree();
        expect(tree.getHierarchicalId('non-existent-uuid')).toBeUndefined();
    });

    test('getNodeByUuid returns undefined for non-existent UUID', () => {
        const resumeData = [{ type: 'Section' }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        expect(tree.getNodeByUuid('non-existent-uuid')).toBeUndefined();
    });

    test('updates index when adding child', () => {
        const tree = new ResumeNodeTree();
        const newNode = assignIds({ type: 'Section', value: 'New' } as BasicResumeNode);
        
        tree.addChild(newNode);
        
        expect(tree.getNodeByUuid(newNode.uuid)).toBe(newNode);
        expect(tree.getHierarchicalId(newNode.uuid)).toEqual([0]);
    });

    test('updates index when adding multiple children', () => {
        const tree = new ResumeNodeTree();
        const node1 = assignIds({ type: 'Section', value: 'First' } as BasicResumeNode);
        const node2 = assignIds({ type: 'Section', value: 'Second' } as BasicResumeNode);
        const node3 = assignIds({ type: 'Section', value: 'Third' } as BasicResumeNode);
        
        tree.addChild(node1);
        tree.addChild(node2);
        tree.addChild(node3);
        
        expect(tree.getHierarchicalId(node1.uuid)).toEqual([0]);
        expect(tree.getHierarchicalId(node2.uuid)).toEqual([1]);
        expect(tree.getHierarchicalId(node3.uuid)).toEqual([2]);
    });

    test('updates index when adding nested child with descendants', () => {
        const resumeData = [{ type: 'Section', value: 'Parent' }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const newNode = assignIds({
            type: 'Entry',
            childNodes: [
                { type: 'RichText', value: 'Child 1' },
                { type: 'RichText', value: 'Child 2' }
            ]
        } as BasicResumeNode);
        
        tree.addNestedChild([0], newNode);
        
        // Parent node should be indexed
        const addedNode = tree.getNodeById([0, 0]);
        expect(tree.getNodeByUuid(addedNode.uuid)).toBe(addedNode);
        expect(tree.getHierarchicalId(addedNode.uuid)).toEqual([0, 0]);
        
        // Children should also be indexed
        if (addedNode.childNodes) {
            expect(tree.getNodeByUuid(addedNode.childNodes[0].uuid)).toBe(addedNode.childNodes[0]);
            expect(tree.getHierarchicalId(addedNode.childNodes[0].uuid)).toEqual([0, 0, 0]);
            
            expect(tree.getNodeByUuid(addedNode.childNodes[1].uuid)).toBe(addedNode.childNodes[1]);
            expect(tree.getHierarchicalId(addedNode.childNodes[1].uuid)).toEqual([0, 0, 1]);
        }
    });

    test('updates index when deleting node with descendants', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry', childNodes: [{ type: 'RichText' }] },
                { type: 'Entry' }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const entry1 = tree.getNodeById([0, 0]);
        const richText = tree.getNodeById([0, 0, 0]);
        const entry2 = tree.getNodeById([0, 1]);
        
        const entry1Uuid = entry1.uuid;
        const richTextUuid = richText.uuid;
        const entry2Uuid = entry2.uuid;
        
        // Delete first entry
        tree.deleteChild([0, 0]);
        
        // Deleted nodes should be removed from index
        expect(tree.getNodeByUuid(entry1Uuid)).toBeUndefined();
        expect(tree.getNodeByUuid(richTextUuid)).toBeUndefined();
        
        // Remaining node should have updated path
        expect(tree.getHierarchicalId(entry2Uuid)).toEqual([0, 0]); // shifted from [0, 1]
    });

    test('updates index when deleting last child', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry', value: 'Only child' }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const entry = tree.getNodeById([0, 0]);
        const entryUuid = entry.uuid;
        
        tree.deleteChild([0, 0]);
        
        expect(tree.getNodeByUuid(entryUuid)).toBeUndefined();
        // Parent should still exist but have no children
        const section = tree.getNodeById([0]);
        expect(section.childNodes).toHaveLength(0);
    });

    test('deleteChild removes entire subtree from index', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [{
                type: 'Entry',
                childNodes: [
                    { type: 'RichText', value: 'A' },
                    { type: 'RichText', value: 'B' },
                    { type: 'RichText', value: 'C' }
                ]
            }]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const entry = tree.getNodeById([0, 0]);
        const childA = tree.getNodeById([0, 0, 0]);
        const childB = tree.getNodeById([0, 0, 1]);
        const childC = tree.getNodeById([0, 0, 2]);
        
        const entryUuid = entry.uuid;
        const childAUuid = childA.uuid;
        const childBUuid = childB.uuid;
        const childCUuid = childC.uuid;
        
        tree.deleteChild([0, 0]);
        
        // All nodes in deleted subtree should be removed
        expect(tree.getNodeByUuid(entryUuid)).toBeUndefined();
        expect(tree.getNodeByUuid(childAUuid)).toBeUndefined();
        expect(tree.getNodeByUuid(childBUuid)).toBeUndefined();
        expect(tree.getNodeByUuid(childCUuid)).toBeUndefined();
    });

    test('updateChild modifies node data without affecting index', () => {
        const resumeData = [{ type: 'Section', value: 'Original' }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const section = tree.getNodeById([0]);
        const uuid = section.uuid;
        const originalPath = tree.getHierarchicalId(uuid);
        
        tree.updateChild([0], 'value', 'Updated');
        
        // UUID index should not change
        expect(tree.getHierarchicalId(uuid)).toEqual(originalPath);
        expect(tree.getNodeById([0]).value).toBe('Updated');
    });

    test('isLastSibling correctly identifies last child', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry' },
                { type: 'Entry' },
                { type: 'Entry' }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        expect(tree.isLastSibling([0, 0])).toBe(false);
        expect(tree.isLastSibling([0, 1])).toBe(false);
        expect(tree.isLastSibling([0, 2])).toBe(true);
    });

    test('isLastSibling with single child', () => {
        const resumeData = [{ type: 'Section', childNodes: [{ type: 'Entry' }] }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        expect(tree.isLastSibling([0, 0])).toBe(true);
    });

    test('moves node up correctly', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry', value: 'First' },
                { type: 'Entry', value: 'Second' }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const first = tree.getNodeById([0, 0]);
        const second = tree.getNodeById([0, 1]);
        const firstUuid = first.uuid;
        const secondUuid = second.uuid;
        
        // Move second entry up
        const newId = tree.moveUp([0, 1]);
        
        expect(newId).toEqual([0, 0]);
        expect(tree.getHierarchicalId(secondUuid)).toEqual([0, 0]);
        expect(tree.getHierarchicalId(firstUuid)).toEqual([0, 1]);
        // Verify order changed
        expect(tree.getNodeById([0, 0]).value).toBe('Second');
        expect(tree.getNodeById([0, 1]).value).toBe('First');
    });

    test('moves node down correctly', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry', value: 'First' },
                { type: 'Entry', value: 'Second' }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const first = tree.getNodeById([0, 0]);
        const second = tree.getNodeById([0, 1]);
        const firstUuid = first.uuid;
        const secondUuid = second.uuid;
        
        // Move first entry down
        const newId = tree.moveDown([0, 0]);
        
        expect(newId).toEqual([0, 1]);
        expect(tree.getHierarchicalId(firstUuid)).toEqual([0, 1]);
        expect(tree.getHierarchicalId(secondUuid)).toEqual([0, 0]);
        // Verify order changed
        expect(tree.getNodeById([0, 0]).value).toBe('Second');
        expect(tree.getNodeById([0, 1]).value).toBe('First');
    });

    test('updates index for nested children when moving parent', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry', childNodes: [{ type: 'RichText', value: 'A' }] },
                { type: 'Entry', childNodes: [{ type: 'RichText', value: 'B' }] }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const entry1 = tree.getNodeById([0, 0]);
        const richTextA = tree.getNodeById([0, 0, 0]);
        const entry2 = tree.getNodeById([0, 1]);
        const richTextB = tree.getNodeById([0, 1, 0]);
        
        // Move second entry up (swaps with first)
        tree.moveUp([0, 1]);
        
        // Entry 2 and its child should be at position 0
        expect(tree.getHierarchicalId(entry2.uuid)).toEqual([0, 0]);
        expect(tree.getHierarchicalId(richTextB.uuid)).toEqual([0, 0, 0]);
        
        // Entry 1 and its child should be at position 1
        expect(tree.getHierarchicalId(entry1.uuid)).toEqual([0, 1]);
        expect(tree.getHierarchicalId(richTextA.uuid)).toEqual([0, 1, 0]);
    });

    test('handles complex tree with multiple operations', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [
                { type: 'Entry', value: 'E1', childNodes: [{ type: 'RichText', value: 'E1-R1' }] },
                { type: 'Entry', value: 'E2', childNodes: [{ type: 'RichText', value: 'E2-R1' }] },
                { type: 'Entry', value: 'E3', childNodes: [{ type: 'RichText', value: 'E3-R1' }] }
            ]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        // Delete middle entry
        const middleEntry = tree.getNodeById([0, 1]);
        const middleEntryUuid = middleEntry.uuid;
        tree.deleteChild([0, 1]);
        
        expect(tree.getNodeByUuid(middleEntryUuid)).toBeUndefined();
        
        // Remaining entries should have correct indices
        const entry1 = tree.getNodeById([0, 0]);
        const entry3 = tree.getNodeById([0, 1]); // Was [0, 2], now [0, 1]
        
        expect(entry1.value).toBe('E1');
        expect(entry3.value).toBe('E3');
        expect(tree.getHierarchicalId(entry1.uuid)).toEqual([0, 0]);
        expect(tree.getHierarchicalId(entry3.uuid)).toEqual([0, 1]);
    });

    test('getParentOfId retrieves correct parent node', () => {
        const resumeData = [{
            type: 'Section',
            childNodes: [{
                type: 'Entry',
                childNodes: [{ type: 'RichText' }]
            }]
        }] as BasicResumeNode[];
        const tree = new ResumeNodeTree(assignIds(resumeData));
        
        const parent1 = tree.getParentOfId([0, 0]);
        expect(parent1.type).toBe('Section');
        
        const parent2 = tree.getParentOfId([0, 0, 0]);
        expect(parent2.type).toBe('Entry');
    });

    test('getNodeById with invalid nested path throws error', () => {
        const tree = new ResumeNodeTree();
        const node = assignIds({ type: 'Section' } as BasicResumeNode);
        tree.addChild(node);
        
        // Accessing a nested child that doesn't exist throws when trying to access undefined.childNodes
        expect(() => {
            tree.getNodeById([0, 0]);
        }).toThrow();
    });

    test('empty tree operations', () => {
        const tree = new ResumeNodeTree();
        
        // Root should have empty childNodes
        expect(tree.childNodes).toHaveLength(0);
        
        // Add first child
        const node = assignIds({ type: 'Section' } as BasicResumeNode);
        tree.addChild(node);
        
        expect(tree.childNodes).toHaveLength(1);
        expect(tree.getNodeByUuid(node.uuid)).toBe(node);
    });
});
