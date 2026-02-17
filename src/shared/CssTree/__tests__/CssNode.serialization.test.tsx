import CssNode from "..";

describe('CssNode - Serialization', () => {
    test('dump returns correct structure', () => {
        const node = new CssNode('Test', { color: 'red' }, 'div');
        node.add('Child', { margin: '10px' }, 'span');
        
        const dump = node.dump();
        
        expect(dump.name).toBe('Test');
        expect(dump.selector).toBe('div');
        expect(dump.properties).toEqual([['color', 'red']]);
        expect(dump.children.length).toBe(1);
        expect(dump.children[0].name).toBe('Child');
    });

    test('dump includes description', () => {
        const node = new CssNode('Test', { color: 'red' }, 'div');
        node.description = 'A test description';
        
        const dump = node.dump();
        
        expect(dump.description).toBe('A test description');
    });

    test('dump with empty properties', () => {
        const node = new CssNode('Test', {}, 'div');
        
        const dump = node.dump();
        
        expect(dump.properties).toEqual([]);
    });

    test('dump with nested children', () => {
        const root = new CssNode('Root', {}, 'body');
        const level1 = root.add('Level1', { padding: '0' }, 'section');
        const level2 = level1.add('Level2', { margin: '0' }, 'article');
        
        const dump = root.dump();
        
        expect(dump.children.length).toBe(1);
        expect(dump.children[0].children.length).toBe(1);
        expect(dump.children[0].children[0].name).toBe('Level2');
    });

    test('load reconstructs tree from dump', () => {
        const original = new CssNode('Root', { background: 'white' }, 'body');
        original.add('Header', { padding: '20px' }, 'header');
        original.add('Content', { margin: '10px' }, 'main');
        
        const dump = original.dump();
        const reconstructed = CssNode.load(dump);
        
        expect(reconstructed.name).toBe('Root');
        expect(reconstructed.selector).toBe('body');
        expect(reconstructed.properties.get('background')).toBe('white');
        expect(reconstructed.children.length).toBe(2);
        expect(reconstructed.findNode(['Header'])?.properties.get('padding')).toBe('20px');
        expect(reconstructed.findNode(['Content'])?.properties.get('margin')).toBe('10px');
    });

    test('load reconstructs nested tree', () => {
        const original = new CssNode('Root', {}, 'body');
        const level1 = original.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', {}, 'article');
        level2.add('Target', { color: 'red' }, 'p');
        
        const dump = original.dump();
        const reconstructed = CssNode.load(dump);
        
        const target = reconstructed.findNode(['Level1', 'Level2', 'Target']) as CssNode;
        expect(target.name).toBe('Target');
        expect(target.properties.get('color')).toBe('red');
    });

    test('load preserves description', () => {
        const original = new CssNode('Test', {}, 'div');
        original.description = 'Test description';
        
        const dump = original.dump();
        const reconstructed = CssNode.load(dump);
        
        expect(reconstructed.description).toBe('Test description');
    });

    test('deepCopy creates independent copy', () => {
        const original = new CssNode('Root', { background: 'white' }, 'body');
        original.add('Child', { color: 'blue' }, 'div');
        
        const copy = original.deepCopy();
        
        expect(copy.name).toBe(original.name);
        expect(copy.selector).toBe(original.selector);
        expect(copy.properties.get('background')).toBe('white');
        expect(copy.children.length).toBe(1);
    });

    test('deepCopy modifications do not affect original', () => {
        const original = new CssNode('Root', { color: 'red' }, 'body');
        original.add('ChildOriginal', {}, 'div');
        
        const copy = original.deepCopy();
        copy.name = 'Copy';
        copy.properties.set('color', 'blue');
        copy.add('ChildCopy', {}, 'span');
        
        expect(original.name).toBe('Root');
        expect(original.properties.get('color')).toBe('red');
        expect(original.children.length).toBe(1);
        expect(copy.name).toBe('Copy');
        expect(copy.properties.get('color')).toBe('blue');
        expect(copy.children.length).toBe(2);
    });

    test('deepCopy creates independent nested structures', () => {
        const original = new CssNode('Root', {}, 'body');
        const level1 = original.add('Level1', { padding: '10px' }, 'section');
        level1.add('Level2', { margin: '5px' }, 'article');
        
        const copy = original.deepCopy();
        const copyLevel1 = copy.findNode(['Level1']) as CssNode;
        const copyLevel2 = copy.findNode(['Level1', 'Level2']) as CssNode;
        
        // Modify copy
        copyLevel1.properties.set('padding', '20px');
        copyLevel2.name = 'Modified';
        
        // Original should be unchanged
        const origLevel1 = original.findNode(['Level1']) as CssNode;
        const origLevel2 = original.findNode(['Level1', 'Level2']) as CssNode;
        
        expect(origLevel1.properties.get('padding')).toBe('10px');
        expect(origLevel2.name).toBe('Level2');
    });

    test('dump/load/dump cycle is consistent', () => {
        const original = new CssNode('Root', { color: 'red', margin: '10px' }, 'body');
        original.add('Child', { padding: '5px' }, 'div');
        
        const dump1 = original.dump();
        const reloaded = CssNode.load(dump1);
        const dump2 = reloaded.dump();
        
        // Compare dumps
        expect(dump1.name).toBe(dump2.name);
        expect(dump1.selector).toBe(dump2.selector);
        expect(dump1.children.length).toBe(dump2.children.length);
        expect(dump1.properties).toEqual(dump2.properties);
    });

    test('load with complex properties preserves all entries', () => {
        const props = [
            ['color', 'red'],
            ['background-color', '#fff'],
            ['font-family', 'Arial, sans-serif'],
            ['border-radius', '5px']
        ];
        
        const dump = {
            name: 'Test',
            selector: 'div',
            properties: props,
            description: undefined,
            children: []
        };
        
        const node = CssNode.load(dump);
        
        expect(node.properties.size).toBe(4);
        expect(node.properties.get('color')).toBe('red');
        expect(node.properties.get('background-color')).toBe('#fff');
        expect(node.properties.get('font-family')).toBe('Arial, sans-serif');
    });
});
