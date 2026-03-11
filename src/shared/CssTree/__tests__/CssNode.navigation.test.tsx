import CssNode from "..";
import { arraysEqual } from "@/shared/utils/arrayHelpers";

describe('CssNode - Navigation & Selectors', () => {
    function makeCssTree() {
        return CssNode.load({
            "name": "Rich Text",
            "selector": ".rich-text",
            "properties": [],
            "description": undefined,
            "children": [
                {
                    "children": [
                        {
                            "children": [],
                            "name": "List Item",
                            "selector": "li",
                            "properties": [["list-style-type", "square"]],
                            "description": undefined
                        }
                    ],
                    "name": "Lists",
                    "selector": "ul",
                    "properties": [["padding-left", "1.5em"]],
                    "description": undefined
                }
            ]
        });
    }

    test('findNode with path array', () => {
        const root = makeCssTree();
        const lists = root.findNode(['Lists']);
        const listItem = root.findNode(['Lists', 'List Item']);
        
        expect(lists).toBeDefined();
        expect(lists?.name).toBe('Lists');
        expect(listItem).toBeDefined();
        expect(listItem?.name).toBe('List Item');
    });

    test('findNode does not mutate the input path array', () => {
        const root = makeCssTree();
        const path = ['Lists', 'List Item'];

        const result = root.findNode(path);

        expect(result?.name).toBe('List Item');
        expect(arraysEqual(path, ['Lists', 'List Item'])).toBe(true);
    });

    test('findNode with string path (single level)', () => {
        const root = makeCssTree();
        const lists = root.findNode('Lists');
        
        expect(lists).toBeDefined();
        expect(lists?.name).toBe('Lists');
    });

    test('findNode with empty path returns this', () => {
        const root = makeCssTree();
        const result = root.findNode([]);
        
        expect(result).toBe(root);
    });

    test('findNode with non-existent path returns undefined', () => {
        const root = makeCssTree();
        const result = root.findNode(['NonExistent']);
        
        expect(result).toBeUndefined();
    });

    test('findNode with non-existent nested path returns undefined', () => {
        const root = makeCssTree();
        const result = root.findNode(['Lists', 'NonExistent']);
        
        expect(result).toBeUndefined();
    });

    test('mustFindNode success returns node', () => {
        const root = makeCssTree();
        const result = root.mustFindNode(['Lists']);
        
        expect(result).toBeDefined();
        expect(result.name).toBe('Lists');
    });

    test('mustFindNode throws error for non-existent path', () => {
        const root = makeCssTree();
        
        expect(() => {
            root.mustFindNode(['NonExistent']);
        }).toThrow(/Couldn't find node at/);
    });

    test('mustFindNode throws error for non-existent nested path', () => {
        const root = makeCssTree();
        
        expect(() => {
            root.mustFindNode(['Lists', 'NonExistent']);
        }).toThrow(/Couldn't find node at/);
    });

    test('fullPath for root node is empty', () => {
        const root = new CssNode('Root', {}, 'body');
        
        expect(arraysEqual(root.fullPath, [])).toBe(true);
    });

    test('fullPath for immediate child', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', {}, 'div');
        
        expect(arraysEqual(child.fullPath, ['Child'])).toBe(true);
    });

    test('fullPath for nested node', () => {
        const root = makeCssTree();
        const lists = root.findNode(['Lists']) as CssNode;
        const listItem = root.findNode(['Lists', 'List Item']) as CssNode;
        
        expect(arraysEqual(lists.fullPath, ['Lists'])).toBe(true);
        expect(arraysEqual(listItem.fullPath, ['Lists', 'List Item'])).toBe(true);
    });

    test('fullSelector for root node', () => {
        const root = new CssNode('Root', {}, 'body');
        
        expect(root.fullSelector).toBe('body');
    });

    test('fullSelector for single child', () => {
        const root = new CssNode('Root', {}, 'body');
        root.add('Child', {}, 'div');
        
        const child = root.children[0];
        expect(child.fullSelector).toBe('body div');
    });

    test('fullSelector with comma selector in parent', () => {
        const root = new CssNode('Root', {}, '.text, #special');
        const child = root.add('Child', {}, 'span');
        
        expect(child.fullSelector).toBe('.text span, #special span');
    });

    test('fullSelector with comma selector in child', () => {
        const root = new CssNode('Root', {}, 'body');
        const child = root.add('Child', {}, 'span, a');
        
        expect(child.fullSelector).toBe('body span, body a');
    });

    test('fullSelector with pseudo-element selector', () => {
        const root = new CssNode('Root', {}, 'span');
        const pseudoElement = root.add('After', {}, '::after');
        
        expect(pseudoElement.fullSelector).toBe('span::after');
    });

    test('fullSelector with nested comma selectors', () => {
        const root = new CssNode('Headings', {}, 'h1, h2');
        const text = root.add('Text', {}, 'p, span');
        const grandchild = text.add('Link', {}, 'a');
        
        expect(grandchild.fullSelector).toBe('h1 p a, h1 span a, h2 p a, h2 span a');
    });

    test('fullSelector with pseudo-elements in complex tree', () => {
        const root = new CssNode('Container', {}, 'div');
        const child = root.add('Content', {}, 'p');
        const pseudo = child.add('Before', {}, '::before');
        const pseudo2 = child.add('After', {}, '::after');
        
        expect(pseudo.fullSelector).toBe('div p::before');
        expect(pseudo2.fullSelector).toBe('div p::after');
    });

    describe('findOrCreateNode', () => {
        test('returns existing node when path already exists', () => {
            const root = makeCssTree();
            const existing = root.findNode(['Lists']) as CssNode;
            const result = root.findOrCreateNode(['Lists']);

            expect(result).toBe(existing);
        });

        test('creates a missing leaf node', () => {
            const root = makeCssTree();
            const result = root.findOrCreateNode(['New Node']);

            expect(result).toBeDefined();
            expect(result.name).toBe('New Node');
            expect(root.findNode(['New Node'])).toBe(result);
        });

        test('creates missing intermediate nodes', () => {
            const root = makeCssTree();
            const result = root.findOrCreateNode(['A', 'B', 'C']);

            expect(result.name).toBe('C');
            expect(root.findNode(['A', 'B', 'C'])).toBe(result);
            expect(root.findNode(['A', 'B'])?.name).toBe('B');
            expect(root.findNode(['A'])?.name).toBe('A');
        });

        test('reuses existing intermediate and creates only missing tail', () => {
            const root = makeCssTree();
            const result = root.findOrCreateNode(['Lists', 'New Child']);

            expect(result.name).toBe('New Child');
            // Existing 'Lists' node is reused, not replaced
            expect(root.findNode(['Lists', 'List Item'])).toBeDefined();
            expect(root.findNode(['Lists', 'New Child'])).toBe(result);
        });

        test('empty path returns this', () => {
            const root = makeCssTree();
            expect(root.findOrCreateNode([])).toBe(root);
        });

        test('created node has no properties', () => {
            const root = makeCssTree();
            const result = root.findOrCreateNode(['Brand New']);

            expect(result.properties.size).toBe(0);
        });

        test('supports names with spaces', () => {
            const root = new CssNode('Root', {}, '.root');
            const result = root.findOrCreateNode(['Page Break']);

            expect(result.name).toBe('Page Break');
            expect(root.findNode(['Page Break'])).toBe(result);
        });
    });
});
