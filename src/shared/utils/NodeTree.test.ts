import ResumeNodeTree from './NodeTree';
import { ResumeNode } from '@/types';

describe('ResumeNodeTree', () => {
    describe('addChild', () => {
        it('should add a child node to an empty tree', () => {
            const tree = new ResumeNodeTree();
            const node: ResumeNode = {
                uuid: 'test-uuid-1',
                type: 'Section',
                value: 'Test Section'
            };

            tree.addChild(node);

            expect(tree.childNodes).toHaveLength(1);
            expect(tree.childNodes[0]).toBe(node);
            expect(tree.childNodes[0].uuid).toBe('test-uuid-1');
        });

        it('should append child nodes to the end of the tree', () => {
            const tree = new ResumeNodeTree();
            const node1: ResumeNode = {
                uuid: 'uuid-1',
                type: 'Section',
                value: 'Section 1'
            };
            const node2: ResumeNode = {
                uuid: 'uuid-2',
                type: 'Section',
                value: 'Section 2'
            };
            const node3: ResumeNode = {
                uuid: 'uuid-3',
                type: 'Section',
                value: 'Section 3'
            };

            tree.addChild(node1);
            tree.addChild(node2);
            tree.addChild(node3);

            expect(tree.childNodes).toHaveLength(3);
            expect(tree.childNodes[0]).toBe(node1);
            expect(tree.childNodes[1]).toBe(node2);
            expect(tree.childNodes[2]).toBe(node3);
        });

        it('should correctly index added nodes by UUID', () => {
            const tree = new ResumeNodeTree();
            const node1: ResumeNode = {
                uuid: 'uuid-1',
                type: 'Section',
                value: 'Section 1'
            };
            const node2: ResumeNode = {
                uuid: 'uuid-2',
                type: 'Section',
                value: 'Section 2'
            };

            tree.addChild(node1);
            tree.addChild(node2);

            // Verify nodes can be retrieved by UUID
            expect(tree.getNodeByUuid('uuid-1')).toBe(node1);
            expect(tree.getNodeByUuid('uuid-2')).toBe(node2);
            
            // Verify hierarchical IDs are correct
            expect(tree.getHierarchicalId('uuid-1')).toEqual([0]);
            expect(tree.getHierarchicalId('uuid-2')).toEqual([1]);
        });

        it('should index nested children when adding a node with descendants', () => {
            const tree = new ResumeNodeTree();
            const childNode: ResumeNode = {
                uuid: 'child-uuid',
                type: 'Entry',
                value: 'Child Entry'
            };
            const parentNode: ResumeNode = {
                uuid: 'parent-uuid',
                type: 'Section',
                value: 'Parent Section',
                childNodes: [childNode]
            };

            tree.addChild(parentNode);

            // Verify both parent and child are indexed
            expect(tree.getNodeByUuid('parent-uuid')).toBe(parentNode);
            expect(tree.getNodeByUuid('child-uuid')).toBe(childNode);
            
            // Verify hierarchical IDs
            expect(tree.getHierarchicalId('parent-uuid')).toEqual([0]);
            expect(tree.getHierarchicalId('child-uuid')).toEqual([0, 0]);
        });

        it('should maintain correct indices after multiple additions', () => {
            const tree = new ResumeNodeTree();
            const nodes: ResumeNode[] = [];

            // Add 5 nodes
            for (let i = 0; i < 5; i++) {
                const node: ResumeNode = {
                    uuid: `uuid-${i}`,
                    type: 'Section',
                    value: `Section ${i}`
                };
                nodes.push(node);
                tree.addChild(node);
            }

            // Verify all nodes are correctly indexed
            for (let i = 0; i < 5; i++) {
                expect(tree.getNodeByUuid(`uuid-${i}`)).toBe(nodes[i]);
                expect(tree.getHierarchicalId(`uuid-${i}`)).toEqual([i]);
            }
        });
    });
});
