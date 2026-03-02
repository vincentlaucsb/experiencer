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
        
        root.setProperties(new Map<string, string>([['new1', 'value1'], ['new2', 'value2']]), ['Child']);
        
        expect(child.properties.size).toBe(2);
        expect(child.properties.get('new1')).toBe('value1');
        expect(child.properties.get('new2')).toBe('value2');
        expect(child.properties.has('old1')).toBe(false);
    });

    test('setProperties on root node', () => {
        const root = new CssNode('Root', { old: 'value' }, 'body');
        
        root.setProperties(new Map<string, string>([['new', 'value']]));
        
        expect(root.properties.size).toBe(1);
        expect(root.properties.get('new')).toBe('value');
        expect(root.properties.has('old')).toBe(false);
    });

    test('setProperties with empty array clears properties', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'red', margin: '10px' }, 'div');
        
        root.setProperties(new Map<string, string>(), ['Child']);
        
        expect(child.properties.size).toBe(0);
    });

    test('setProperties accepts plain object input', () => {
        const root = new CssNode('Root', { old: 'value' }, 'body');

        root.setProperties({
            color: 'red',
            margin: '10px'
        });

        expect(root.properties.size).toBe(2);
        expect(root.properties.get('color')).toBe('red');
        expect(root.properties.get('margin')).toBe('10px');
        expect(root.properties.has('old')).toBe(false);
    });

    test('setProperties callback adds new properties', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'red' }, 'div');
        
        root.setProperties((current) => {
            const next = new Map<string, string>(current);
            next.set('margin', '10px');
            next.set('padding', '5px');
            return next;
        }, ['Child']);
        
        expect(child.properties.size).toBe(3);
        expect(child.properties.get('color')).toBe('red');
        expect(child.properties.get('margin')).toBe('10px');
        expect(child.properties.get('padding')).toBe('5px');
    });

    test('setProperties callback overwrites existing properties', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', { color: 'red', margin: '10px' }, 'div');
        
        root.setProperties((current) => {
            const next = new Map<string, string>(current);
            next.set('color', 'blue');
            next.set('padding', '5px');
            return next;
        }, ['Child']);
        
        expect(child.properties.size).toBe(3);
        expect(child.properties.get('color')).toBe('blue');
        expect(child.properties.get('margin')).toBe('10px');
        expect(child.properties.get('padding')).toBe('5px');
    });

    test('setProperties callback on root node', () => {
        const root = new CssNode('Root', { color: 'black' }, 'body');
        
        root.setProperties((current) => {
            const next = new Map<string, string>(current);
            next.set('margin', '0');
            return next;
        });
        
        expect(root.properties.size).toBe(2);
        expect(root.properties.get('color')).toBe('black');
        expect(root.properties.get('margin')).toBe('0');
    });

    test('setProperties callback may return plain object', () => {
        const root = new CssNode('Root', { color: 'black' }, 'body');

        root.setProperties((current) => ({
            color: current.get('color') ?? 'black',
            padding: '5px'
        }));

        expect(root.properties.size).toBe(2);
        expect(root.properties.get('color')).toBe('black');
        expect(root.properties.get('padding')).toBe('5px');
    });

    test('setProperties callback on deeply nested node', () => {
        const root = new CssNode('Root', {}, 'body');
        const level1 = root.add('Level1', {}, 'section');
        const level2 = level1.add('Level2', { old: 'value' }, 'article');
        
        root.setProperties((current) => {
            const next = new Map<string, string>(current);
            next.set('new', 'value');
            return next;
        }, ['Level1', 'Level2']);
        
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

    test('setProperties callback affects stylesheet output', () => {
        const root = new CssNode('Test', {}, 'div');
        root.setProperties((current) => {
            const next = new Map<string, string>(current);
            next.set('color', 'red');
            next.set('margin', '10px');
            return next;
        });
        
        const stylesheet = root.stylesheet();
        expect(stylesheet).toContain('color: red;');
        expect(stylesheet).toContain('margin: 10px;');
    });
});
