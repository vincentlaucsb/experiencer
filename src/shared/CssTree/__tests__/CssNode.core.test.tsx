import CssNode from "..";

describe('CssNode - Core Operations', () => {
    test('constructor with properties', () => {
        const node = new CssNode('Test', { color: 'red', 'font-size': '12px' }, 'div');
        
        expect(node.name).toBe('Test');
        expect(node.selector).toBe('div');
        expect(node.properties.size).toBe(2);
        expect(node.properties.get('color')).toBe('red');
        expect(node.properties.get('font-size')).toBe('12px');
    });

    test('constructor with empty properties', () => {
        const node = new CssNode('Button', {});
        
        expect(node.name).toBe('Button');
        expect(node.selector).toBe('Button');
        expect(node.properties.size).toBe(0);
    });

    test('constructor selector defaults to name', () => {
        const node = new CssNode('CustomClass', { margin: '0' });
        
        expect(node.selector).toBe('CustomClass');
    });

    test('add method returns added node', () => {
        const parent = new CssNode('Parent', {}, 'div');
        const child = parent.add('Child', { color: 'blue' }, 'span');
        
        expect(child.name).toBe('Child');
        expect(child.selector).toBe('span');
        expect(child.properties.get('color')).toBe('blue');
        expect(parent.children.length).toBe(1);
    });

    test('add method with default selector', () => {
        const parent = new CssNode('Parent', {}, 'div');
        const child = parent.add('Child', { padding: '10px' });
        
        expect(child.selector).toBe('Child');
    });

    test('addNode returns added node', () => {
        const parent = new CssNode('Parent', {}, 'div');
        const childNode = new CssNode('Child', { color: 'green' }, 'p');
        const result = parent.addNode(childNode);
        
        expect(result).toBe(childNode);
        expect(parent.children.length).toBe(1);
    });

    test('hasName returns true for existing child', () => {
        const parent = new CssNode('Parent', {}, 'div');
        parent.add('Child1', {});
        parent.add('Child2', {});
        
        expect(parent.hasName('Child1')).toBe(true);
        expect(parent.hasName('Child2')).toBe(true);
    });

    test('hasName returns false for non-existent child', () => {
        const parent = new CssNode('Parent', {}, 'div');
        parent.add('Child1', {});
        
        expect(parent.hasName('NonExistent')).toBe(false);
    });

    test('duplicate name throws error', () => {
        const parent = new CssNode('Parent', {}, 'div');
        parent.add('Child', {});
        
        expect(() => parent.add('Child', {})).toThrow('Already have a child named Child');
    });

    test('description property can be set and get', () => {
        const node = new CssNode('Test', {}, 'div');
        node.description = 'A test node';
        
        expect(node.description).toBe('A test node');
    });

    test('indent getter and setter', () => {
        const node = new CssNode('Test', {}, 'div');
        
        expect(node.indent).toBe('  '); // DEFAULT_INDENT
        node.indent = '\t';
        expect(node.indent).toBe('\t');
    });

    test('name getter and setter', () => {
        const node = new CssNode('Original', {}, 'div');
        
        expect(node.name).toBe('Original');
        node.name = 'Updated';
        expect(node.name).toBe('Updated');
    });

    test('selector getter and setter', () => {
        const node = new CssNode('Test', {}, '.original');
        
        expect(node.selector).toBe('.original');
        node.selector = '.updated';
        expect(node.selector).toBe('.updated');
    });

    test('properties getter and setter', () => {
        const node = new CssNode('Test', { old: 'value' }, 'div');
        
        const newProps = new Map([['new', 'value']]);
        node.properties = newProps;
        
        expect(node.properties.get('new')).toBe('value');
        expect(node.properties.has('old')).toBe(false);
    });
});
