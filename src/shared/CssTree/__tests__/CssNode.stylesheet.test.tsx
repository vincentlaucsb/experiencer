import CssNode from "..";

describe('CssNode - Stylesheet Generation', () => {
    test('stylesheet with single property', () => {
        const node = new CssNode('Text Field', {
            "font-family": "Tahoma, sans-serif"
        }, 'span');
        
        expect(node.stylesheet()).toBe(`span {
  font-family: Tahoma, sans-serif;
}`);
    });

    test('stylesheet with multiple properties', () => {
        const node = new CssNode('Button', {
            "background-color": "blue",
            "color": "white",
            "padding": "10px"
        }, 'button');
        
        const stylesheet = node.stylesheet();
        expect(stylesheet).toContain('background-color: blue;');
        expect(stylesheet).toContain('color: white;');
        expect(stylesheet).toContain('padding: 10px;');
    });

    test('stylesheet with comma selector', () => {
        const node = new CssNode('Text Field', {
            "font-family": "Tahoma, sans-serif"
        }, 'span, a');
        
        expect(node.stylesheet()).toBe(`span, a {
  font-family: Tahoma, sans-serif;
}`);
    });

    test('stylesheet with multiple comma selectors', () => {
        const node = new CssNode('Headings', {
            "font-weight": "bold"
        }, 'h1, h2, h3');
        
        expect(node.stylesheet()).toBe(`h1, h2, h3 {
  font-weight: bold;
}`);
    });

    test('stylesheet with children', () => {
        const node = new CssNode('Text Field', {
            "font-family": "Tahoma, sans-serif"
        }, 'span');
        node.add('Bold', { "font-size": "120%" }, 'strong');
        
        expect(node.stylesheet()).toBe(`span {
  font-family: Tahoma, sans-serif;
}

span strong {
  font-size: 120%;
}`);
    });

    test('stylesheet with multiple children', () => {
        const node = new CssNode('Container', {}, 'div');
        node.add('Header', { "background": "blue" }, 'header');
        node.add('Footer', { "background": "gray" }, 'footer');
        
        const stylesheet = node.stylesheet();
        expect(stylesheet).toContain('div header {');
        expect(stylesheet).toContain('background: blue;');
        expect(stylesheet).toContain('div footer {');
        expect(stylesheet).toContain('background: gray;');
    });

    test('stylesheet with comma selector and children', () => {
        const node = new CssNode('Text Field', {
            "font-family": "Tahoma, sans-serif"
        }, 'span, a');
        
        const boldNode = node.add('Bold', { "font-size": "120%" }, 'strong');
        
        expect(boldNode.fullSelector).toBe('span strong, a strong');
        expect(node.stylesheet()).toBe(`span, a {
  font-family: Tahoma, sans-serif;
}

span strong, a strong {
  font-size: 120%;
}`);
    });

    test('stylesheet with pseudo-elements', () => {
        const node = new CssNode('Text Field', {
            "font-family": "Tahoma, sans-serif"
        }, 'span');
        
        let after = node.add('::after', { "content": '","' });
        node.add('Bold', { "font-size": "120%" }, 'strong');
        
        expect(after.fullSelector).toBe('span::after');
        expect(node.stylesheet()).toBe(`span {
  font-family: Tahoma, sans-serif;
}

span::after {
  content: ",";
}

span strong {
  font-size: 120%;
}`);
    });

    test('stylesheet with deeply nested children', () => {
        const root = new CssNode('Root', { color: 'black' }, 'body');
        const section = root.add('Section', { padding: '20px' }, 'section');
        const article = section.add('Article', { margin: '10px' }, 'article');
        
        const stylesheet = root.stylesheet();
        expect(stylesheet).toContain('body {');
        expect(stylesheet).toContain('body section {');
        expect(stylesheet).toContain('body section article {');
    });

    test('stylesheet with empty properties skips node', () => {
        const root = new CssNode('Root', {}, 'body');
        root.add('Child', { "color": "red" }, 'div');
        
        const stylesheet = root.stylesheet();
        // Root has no properties, so it shouldn't appear (but there may be whitespace)
        expect(stylesheet.trim()).toBe(`body div {
  color: red;
}`)
    });

    test('stylesheet with mixed empty and populated nodes', () => {
        const root = new CssNode('Root', { padding: '0' }, 'body');
        const section = root.add('Section', {}, 'section');
        section.add('Paragraph', { margin: '10px' }, 'p');
        
        const stylesheet = root.stylesheet();
        expect(stylesheet).toContain('body {');
        expect(stylesheet).toContain('body section p {');
    });

    test('stylesheet after modifying properties', () => {
        const node = new CssNode('Test', {}, 'div');
        expect(node.stylesheet()).toBe('');
        
        node.setProperty([], 'color', 'red');
        expect(node.stylesheet()).toBe(`div {
  color: red;
}`);
        
        node.setProperty([], 'margin', '10px');
        const stylesheet = node.stylesheet();
        expect(stylesheet).toContain('color: red;');
        expect(stylesheet).toContain('margin: 10px;');
    });

    test('stylesheet respects custom indent', () => {
        const node = new CssNode('Test', { color: 'red' }, 'div');
        node.indent = '\t';
        
        expect(node.stylesheet()).toBe(`div {
\tcolor: red;
}`);
    });

    test('stylesheet with complex selector combinations', () => {
        const root = new CssNode('Root', {}, 'div.container, section.wrapper');
        const child = root.add('Child', {}, 'p:first-child, p:last-child');
        
        expect(child.fullSelector).toBe('div.container p:first-child, div.container p:last-child, section.wrapper p:first-child, section.wrapper p:last-child');
    });
});
