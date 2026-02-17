import CssNode from "..";

describe('CssNode - Tree Operations', () => {
    test('copySkeleton without parameters', () => {
        const original = new CssNode('Root', { margin: '10px' }, 'body');
        original.add('Child', { padding: '5px' }, 'div');
        
        const skeleton = original.copySkeleton();
        
        expect(skeleton.name).toBe('Root');
        expect(skeleton.selector).toBe('body');
        expect(skeleton.properties.size).toBe(0);
        expect(skeleton.children.length).toBe(1);
        expect(skeleton.children[0].properties.size).toBe(0);
    });

    test('copySkeleton with custom name', () => {
        const original = new CssNode('Root', { margin: '10px' }, 'body');
        original.add('Child', { padding: '5px' }, 'div');
        
        const skeleton = original.copySkeleton('NewRoot');
        
        expect(skeleton.name).toBe('NewRoot');
        expect(skeleton.selector).toBe('body');
        expect(skeleton.properties.size).toBe(0);
        expect(skeleton.children[0].name).toBe('Child');
    });

    test('copySkeleton with custom selector', () => {
        const original = new CssNode('Root', { margin: '10px' }, 'body');
        original.add('Child', { padding: '5px' }, 'div');
        
        const skeleton = original.copySkeleton(undefined, '.custom');
        
        expect(skeleton.name).toBe('Root');
        expect(skeleton.selector).toBe('.custom');
        expect(skeleton.properties.size).toBe(0);
    });

    test('copySkeleton with custom name and selector', () => {
        const original = new CssNode('Root', { margin: '10px' }, 'body');
        
        const skeleton = original.copySkeleton('NewName', '.new-selector');
        
        expect(skeleton.name).toBe('NewName');
        expect(skeleton.selector).toBe('.new-selector');
    });

    test('children getter returns array of child nodes', () => {
        const parent = new CssNode('Parent', {}, 'div');
        const child1 = parent.add('Child1', {}, 'span');
        const child2 = parent.add('Child2', {}, 'p');
        
        const children = parent.children;
        
        expect(Array.isArray(children)).toBe(true);
        expect(children.length).toBe(2);
        expect(children[0].name).toBe('Child1');
        expect(children[1].name).toBe('Child2');
    });

    test('isRoot returns true for root node', () => {
        const root = new CssNode('Root', {}, 'div');
        
        expect(root.isRoot).toBe(true);
    });

    test('isRoot returns false for non-root node', () => {
        const parent = new CssNode('Parent', {}, 'div');
        const child = parent.add('Child', {}, 'span');
        
        expect(child.isRoot).toBe(false);
    });

    test('treeRoot returns itself for root node', () => {
        const root = new CssNode('Root', {}, 'div');
        
        expect(root.treeRoot).toBe(root);
    });

    test('treeRoot returns root for nested node', () => {
        const root = new CssNode('Root', {}, 'div');
        const level1 = root.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', {}, 'article');
        const level3 = level2.add('Level3', {}, 'p');
        
        expect(level1.treeRoot).toBe(root);
        expect(level2.treeRoot).toBe(root);
        expect(level3.treeRoot).toBe(root);
    });

    test('delete immediate child', () => {
        const parent = new CssNode('Parent', {}, 'div');
        parent.add('Child1', {}, 'span');
        parent.add('Child2', {}, 'p');
        parent.add('Child3', {}, 'a');
        
        expect(parent.hasName('Child2')).toBe(true);
        expect(parent.children.length).toBe(3);
        
        parent.delete(['Child2']);
        
        expect(parent.hasName('Child2')).toBe(false);
        expect(parent.children.length).toBe(2);
        expect(parent.findNode(['Child1'])).toBeDefined();
        expect(parent.findNode(['Child3'])).toBeDefined();
    });

    test('delete nested child', () => {
        const root = new CssNode('Root', {}, 'body');
        const parent = root.add('Parent', {}, 'div');
        parent.add('Child1', {}, 'span');
        parent.add('Child2', {}, 'p');
        
        expect(parent.hasName('Child2')).toBe(true);
        expect(parent.children.length).toBe(2);
        
        root.delete(['Parent', 'Child2']);
        
        expect(parent.hasName('Child2')).toBe(false);
        expect(parent.children.length).toBe(1);
        expect(root.findNode(['Parent', 'Child2'])).toBeUndefined();
    });

    test('delete with non-existent path does nothing', () => {
        const parent = new CssNode('Parent', {}, 'div');
        parent.add('Child1', {}, 'span');
        
        expect(() => {
            parent.delete(['NonExistent']);
        }).not.toThrow();
        
        expect(parent.children.length).toBe(1);
    });

    test('delete deeply nested child', () => {
        const root = new CssNode('Root', {}, 'body');
        const level1 = root.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', {}, 'article');
        level2.add('Target', {}, 'p');
        level2.add('Other', {}, 'span');
        
        root.delete(['Level1', 'Level2', 'Target']);
        
        expect(level2.hasName('Target')).toBe(false);
        expect(level2.hasName('Other')).toBe(true);
        expect(root.findNode(['Level1', 'Level2', 'Target'])).toBeUndefined();
    });
});
