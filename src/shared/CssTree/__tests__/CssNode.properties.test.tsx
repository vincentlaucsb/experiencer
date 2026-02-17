import CssNode from "..";

describe('CssNode - Property Management', () => {
    test('setProperty sets single property on node', () => {
        const root = new CssNode('Root', {}, 'body');
        root.add('Child', {}, 'div');
        
        root.setProperty(['Child'], 'color', 'red');
        
        const child = root.findNode(['Child']) as CssNode;
        expect(child.properties.get('color')).toBe('red');
    });

    test('setProperty overwrites existing property', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'blue' }, 'div');
        
        root.setProperty(['Child'], 'color', 'red');
        
        expect(child.properties.get('color')).toBe('red');
    });

    test('setProperty on deeply nested node', () => {
        const root = new CssNode('Root', {}, 'body');
        const level1 = root.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', {}, 'article');
        
        root.setProperty(['Level1', 'Level2'], 'font-size', '16px');
        
        expect(level2.properties.get('font-size')).toBe('16px');
    });

    test('deleteProperty removes property from node', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'blue', margin: '10px' }, 'div');
        
        expect(child.properties.has('color')).toBe(true);
        
        root.deleteProperty(['Child'], 'color');
        
        expect(child.properties.has('color')).toBe(false);
        expect(child.properties.has('margin')).toBe(true);
    });

    test('deleteProperty on deeply nested node', () => {
        const root = new CssNode('Root', {}, 'body');
        const level1 = root.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', { padding: '5px' }, 'article');
        
        root.deleteProperty(['Level1', 'Level2'], 'padding');
        
        expect(level2.properties.has('padding')).toBe(false);
    });

    test('deleteProperty on non-existent property does nothing', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'blue' }, 'div');
        
        expect(() => {
            root.deleteProperty(['Child'], 'non-existent');
        }).not.toThrow();
        
        expect(child.properties.get('color')).toBe('blue');
    });

    test('setProperties replaces all properties on node', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { old1: 'value1', old2: 'value2' }, 'div');
        
        root.setProperties([['new1', 'value1'], ['new2', 'value2']], ['Child']);
        
        expect(child.properties.size).toBe(2);
        expect(child.properties.get('new1')).toBe('value1');
        expect(child.properties.get('new2')).toBe('value2');
        expect(child.properties.has('old1')).toBe(false);
    });

    test('setProperties on root node', () => {
        const root = new CssNode('Root', { old: 'value' }, 'body');
        
        root.setProperties([['new', 'value']]);
        
        expect(root.properties.size).toBe(1);
        expect(root.properties.get('new')).toBe('value');
        expect(root.properties.has('old')).toBe(false);
    });

    test('setProperties with empty array clears properties', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'red', margin: '10px' }, 'div');
        
        root.setProperties([], ['Child']);
        
        expect(child.properties.size).toBe(0);
    });

    test('updateProperties adds new properties', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'red' }, 'div');
        
        root.updateProperties([['margin', '10px'], ['padding', '5px']], ['Child']);
        
        expect(child.properties.size).toBe(3);
        expect(child.properties.get('color')).toBe('red');
        expect(child.properties.get('margin')).toBe('10px');
        expect(child.properties.get('padding')).toBe('5px');
    });

    test('updateProperties overwrites existing properties', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'red', margin: '10px' }, 'div');
        
        root.updateProperties([['color', 'blue'], ['padding', '5px']], ['Child']);
        
        expect(child.properties.size).toBe(3);
        expect(child.properties.get('color')).toBe('blue');
        expect(child.properties.get('margin')).toBe('10px');
        expect(child.properties.get('padding')).toBe('5px');
    });

    test('updateProperties on root node', () => {
        const root = new CssNode('Root', { color: 'black' }, 'body');
        
        root.updateProperties([['margin', '0']]);
        
        expect(root.properties.size).toBe(2);
        expect(root.properties.get('color')).toBe('black');
        expect(root.properties.get('margin')).toBe('0');
    });

    test('updateProperties on deeply nested node', () => {
        const root = new CssNode('Root', {}, 'body');
        const level1 = root.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', { old: 'value' }, 'article');
        
        root.updateProperties([['new', 'value']], ['Level1', 'Level2']);
        
        expect(level2.properties.size).toBe(2);
        expect(level2.properties.get('old')).toBe('value');
        expect(level2.properties.get('new')).toBe('value');
    });

    test('setProperty affects stylesheet output', () => {
        const root = new CssNode('Test', {}, 'div');
        root.setProperty([], 'color', 'red');
        
        const stylesheet = root.stylesheet();
        expect(stylesheet).toContain('color: red;');
    });

    test('deleteProperty affects stylesheet output', () => {
        const root = new CssNode('Test', { color: 'red', margin: '10px' }, 'div');
        root.deleteProperty([], 'color');
        
        const stylesheet = root.stylesheet();
        expect(stylesheet).not.toContain('color');
        expect(stylesheet).toContain('margin: 10px;');
    });

    test('updateProperties affects stylesheet output', () => {
        const root = new CssNode('Test', {}, 'div');
        root.updateProperties([['color', 'red'], ['margin', '10px']]);
        
        const stylesheet = root.stylesheet();
        expect(stylesheet).toContain('color: red;');
        expect(stylesheet).toContain('margin: 10px;');
    });
});
