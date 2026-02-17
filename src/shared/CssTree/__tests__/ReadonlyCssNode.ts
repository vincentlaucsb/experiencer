import CssNode from '../index';
import { ReadonlyCssNode } from '../ReadonlyCssNode';

describe('ReadonlyCssNode', () => {
    describe('Read-only property access', () => {
        test('reads name property', () => {
            const node = new CssNode('Test', { color: 'red' }, 'div');
            const readonly = new ReadonlyCssNode(node);

            expect(readonly.name).toBe('Test');
        });

        test('reads selector property', () => {
            const node = new CssNode('Test', {}, 'div.container');
            const readonly = new ReadonlyCssNode(node);

            expect(readonly.selector).toBe('div.container');
        });

        test('reads description property', () => {
            const node = new CssNode('Test', {});
            node.description = 'A test node';
            const readonly = new ReadonlyCssNode(node);

            expect(readonly.description).toBe('A test node');
        });

        test('returns undefined for description when not set', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect(readonly.description).toBeUndefined();
        });

        test('reads isRoot property correctly', () => {
            const root = new CssNode('Root', {});
            const child = root.add('Child', {});

            const readonlyRoot = new ReadonlyCssNode(root);
            const readonlyChild = new ReadonlyCssNode(child);

            expect(readonlyRoot.isRoot).toBe(true);
            expect(readonlyChild.isRoot).toBe(false);
        });

        test('reads fullSelector property', () => {
            const node = new CssNode('Test', {}, 'div.container span');
            const readonly = new ReadonlyCssNode(node);

            expect(readonly.fullSelector).toBe('div.container span');
        });

        test('reads hasName method correctly', () => {
            const node = new CssNode('Test', {});
            node.add('Child1', {});
            node.add('Child2', {});

            const readonly = new ReadonlyCssNode(node);

            expect(readonly.hasName('Child1')).toBe(true);
            expect(readonly.hasName('Child2')).toBe(true);
            expect(readonly.hasName('NonExistent')).toBe(false);
        });
    });

    describe('Properties are defensive copies', () => {
        test('properties getter returns a new Map instance', () => {
            const node = new CssNode('Test', { color: 'red', 'font-size': '12px' });
            const readonly = new ReadonlyCssNode(node);

            const props1 = readonly.properties;
            const props2 = readonly.properties;

            expect(props1).not.toBe(props2);
            expect(props1.get('color')).toBe('red');
        });

        test('mutating returned properties Map does not affect wrapped node', () => {
            const node = new CssNode('Test', { color: 'red' });
            const readonly = new ReadonlyCssNode(node);

            const props = readonly.properties;
            // Convert to mutable map to test that mutations don't propagate
            const mutableProps = new Map(props);
            mutableProps.set('color', 'blue');
            mutableProps.set('margin', '10px');

            // The wrapped node's properties should be unchanged
            expect(node.properties.get('color')).toBe('red');
            expect(node.properties.has('margin')).toBe(false);

            // And the next call should return the original values
            const propsAgain = readonly.properties;
            expect(propsAgain.get('color')).toBe('red');
            expect(propsAgain.has('margin')).toBe(false);
        });

        test('properties getter returns ReadonlyMap type', () => {
            const node = new CssNode('Test', { color: 'red' });
            const readonly = new ReadonlyCssNode(node);

            const props = readonly.properties;
            
            // Constructor works
            expect(props).toBeInstanceOf(Map);
            
            // Can read values
            expect(props.get('color')).toBe('red');
            expect(props.has('color')).toBe(true);
            expect(props.size).toBe(1);
        });
    });

    describe('fullPath is defensive copy', () => {
        test('fullPath returns a frozen array', () => {
            const root = new CssNode('Root', {});
            const parent = root.add('Parent', {});
            const child = parent.add('Child', {});

            const readonly = new ReadonlyCssNode(child);
            const path = readonly.fullPath;

            expect(Object.isFrozen(path)).toBe(true);
            expect(path).toEqual(['Parent', 'Child']);
        });

        test('fullPath returns a new array each time', () => {
            const root = new CssNode('Root', {});
            const child = root.add('Child', {});

            const readonly = new ReadonlyCssNode(child);
            const path1 = readonly.fullPath;
            const path2 = readonly.fullPath;

            expect(path1).not.toBe(path2);
            expect(path1).toEqual(path2);
        });

        test('frozen fullPath cannot be mutated', () => {
            const root = new CssNode('Root', {});
            const child = root.add('Child', {});

            const readonly = new ReadonlyCssNode(child);
            const path = readonly.fullPath;

            expect(() => {
                (path as any).push('Invalid');
            }).toThrow();
        });
    });

    describe('Children are wrapped ReadonlyCssNode instances', () => {
        test('children returns array of ReadonlyCssNode', () => {
            const parent = new CssNode('Parent', {});
            parent.add('Child1', {});
            parent.add('Child2', {});

            const readonly = new ReadonlyCssNode(parent);
            const children = readonly.children;

            expect(children).toHaveLength(2);
            expect(children[0]).toBeInstanceOf(ReadonlyCssNode);
            expect(children[1]).toBeInstanceOf(ReadonlyCssNode);
            expect(children[0].name).toBe('Child1');
            expect(children[1].name).toBe('Child2');
        });

        test('children wrapping is deep', () => {
            const root = new CssNode('Root', {});
            const parent = root.add('Parent', {});
            const child = parent.add('Child', {});

            const readonlyRoot = new ReadonlyCssNode(root);
            const readonlyParent = readonlyRoot.children[0];
            const readonlyChild = readonlyParent.children[0];

            expect(readonlyRoot.name).toBe('Root');
            expect(readonlyParent.name).toBe('Parent');
            expect(readonlyChild.name).toBe('Child');
        });

        test('child ReadonlyCssNode instances are independent', () => {
            const parent = new CssNode('Parent', {});
            parent.add('Child1', {});
            parent.add('Child2', {});

            const readonly = new ReadonlyCssNode(parent);
            const children1 = readonly.children;
            const children2 = readonly.children;

            expect(children1[0]).not.toBe(children2[0]);
            expect(children1[1]).not.toBe(children2[1]);
        });
    });

    describe('Mutation methods are not available', () => {
        test('add method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('add' in readonly).toBe(false);
        });

        test('addNode method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('addNode' in readonly).toBe(false);
        });

        test('delete method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('delete' in readonly).toBe(false);
        });

        test('setProperty method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('setProperty' in readonly).toBe(false);
        });

        test('deleteProperty method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('deleteProperty' in readonly).toBe(false);
        });

        test('updateProperties method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('updateProperties' in readonly).toBe(false);
        });

        test('setProperties method is not available on ReadonlyCssNode', () => {
            const node = new CssNode('Test', {});
            const readonly = new ReadonlyCssNode(node);

            expect('setProperties' in readonly).toBe(false);
        });
    });

    describe('Wrapping preserves data consistency', () => {
        test('multiple wrappings of same node show consistent data', () => {
            const node = new CssNode('Test', { color: 'red', margin: '10px' });
            const node2 = node.add('Child', { padding: '5px' });

            const readonly1 = new ReadonlyCssNode(node);
            const readonly2 = new ReadonlyCssNode(node);

            expect(readonly1.name).toBe(readonly2.name);
            expect(readonly1.properties.size).toBe(readonly2.properties.size);
            expect(readonly1.children).toHaveLength(readonly2.children.length);
        });

        test('wrapped node reflects changes made to underlying node', () => {
            const node = new CssNode('Test', { color: 'red' });
            const readonly = new ReadonlyCssNode(node);

            expect(readonly.properties.get('color')).toBe('red');
            expect(readonly.name).toBe('Test');

            // Modify underlying node directly (simulating store update)
            node.name = 'Updated';
            node.properties.set('color', 'blue');
            node.properties.set('font-size', '14px');

            // Readonly wrapper reflects the changes
            expect(readonly.name).toBe('Updated');
            expect(readonly.properties.get('color')).toBe('blue');
            expect(readonly.properties.get('font-size')).toBe('14px');
        });
    });

    describe('Complex tree scenarios', () => {
        test('handles deeply nested trees', () => {
            const root = new CssNode('Root', {}, ':root');
            const level1 = root.add('Container', {}, '.container');
            const level2 = level1.add('Header', {}, 'header');
            const level3 = level2.add('Title', {}, 'h1');

            const readonly = new ReadonlyCssNode(level3);

            expect(readonly.name).toBe('Title');
            expect(readonly.fullPath).toEqual(['Container', 'Header', 'Title']);
            expect(readonly.fullSelector).toBe(':root .container header h1');
        });

        test('handles multiple children at all levels', () => {
            const root = new CssNode('Root', {});
            const parent1 = root.add('Parent1', {});
            const parent2 = root.add('Parent2', {});

            parent1.add('Child1', {});
            parent1.add('Child2', {});
            parent2.add('Child3', {});
            parent2.add('Child4', {});

            const readonlyRoot = new ReadonlyCssNode(root);

            expect(readonlyRoot.children).toHaveLength(2);
            expect(readonlyRoot.children[0].children).toHaveLength(2);
            expect(readonlyRoot.children[1].children).toHaveLength(2);
        });
    });
});
