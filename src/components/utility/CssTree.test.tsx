import CssNode from "./CssTree";
import { arraysEqual } from "../Helpers";

function makeCssTree() {
    return CssNode.load({
        "name": "Rich Text",
        "selector": ".rich-text",
        "properties": [],
        "children": [
            {
                "children": [
                    {
                        "children": [],
                        "name": "List Item",
                        "selector": "li",
                        "properties": [["list-style-type", "square"]]
                    }
                ],
                "name": "Lists",
                "selector": "ul",
                "properties": [["padding-left", "1.5em"]]
            }
        ]
    });
}

test('copySkeleton Test', () => {
    const cssNode = makeCssTree();
    const copy = cssNode.copySkeleton();

    expect(copy.name).toBe(cssNode.name);
    expect(copy.selector).toBe(cssNode.selector);

    const copiedListsCss = copy.findNode(['Lists']) as CssNode;
    const copiedListItemCss = copy.findNode(['Lists', 'List Item']) as CssNode;

    expect(copiedListsCss).toBeDefined();
    expect(copiedListsCss.properties.size).toBe(0);

    expect(copiedListItemCss).toBeDefined();
    expect(copiedListItemCss.properties.size).toBe(0);
});

test('findNode Test', () => {
    const cssNode = makeCssTree();
    const listCss = cssNode.findNode(['Lists']) as CssNode;
    const listItemCss = cssNode.findNode(['Lists', 'List Item']) as CssNode;

    expect(listCss).toBeDefined();
    expect(listCss.fullSelector).toEqual('.rich-text ul');

    expect(listItemCss).toBeDefined();
    expect(listItemCss.fullSelector).toEqual('.rich-text ul li');
})

test('find Test', () => {
    const cssNode = makeCssTree();
    const listCss = cssNode.findNode('Lists') as CssNode;
    const listItemCss = cssNode.findNode(['Lists', 'List Item']) as CssNode;

    expect(listCss).toBeDefined();
    expect(arraysEqual(listCss.fullPath, ['Lists'])).toBeTruthy();

    expect(listItemCss).toBeDefined();
    expect(arraysEqual(listItemCss.fullPath, ['Lists', 'List Item'])).toBeTruthy();
})

test('fullSelector Test - Complex Tree', () => {
    let cssNode = new CssNode('Headings', {}, 'h1, h2');
    let text = cssNode.add('Text', {}, 'p, span');
    let grandchild = text.add('Link', {}, 'a');
    expect(grandchild.fullSelector).toBe('h1 p a, h1 span a, h2 p a, h2 span a');
})

test('No Duplicate Test', () => {
    const cssNode = makeCssTree();
    cssNode.add(':after', {});
    expect(cssNode.hasName(':after'));

    const addDup = () => {
        cssNode.add(':after', {});
    };

    expect(addDup).toThrow();
});

test('Stylesheet Test', () => {
    const cssNode = new CssNode('Text Field', {
            "font-family": "Tahoma, sans-serif"
        }, 'span');
    expect(cssNode.stylesheet()).toBe(`span {
\tfont-family: Tahoma, sans-serif;
}`);
})

test('Stylesheet Comma Test', () => {
    const cssNode = new CssNode('Text Field', {
        "font-family": "Tahoma, sans-serif"
    }, 'span, a');
    expect(cssNode.stylesheet()).toBe(`span, a {
\tfont-family: Tahoma, sans-serif;
}`);
})

test('Stylesheet Test w/ Children', () => {
    const cssNode = new CssNode('Text Field', {
        "font-family": "Tahoma, sans-serif"
    }, 'span');
    cssNode.add('Bold', { "font-size": "120%" }, 'strong');

    expect(cssNode.stylesheet()).toBe(`span {
\tfont-family: Tahoma, sans-serif;
}

span strong {
\tfont-size: 120%;
}`);
})

test('Stylesheet Test w/ Children + Comma', () => {
    const cssNode = new CssNode('Text Field', {
        "font-family": "Tahoma, sans-serif"
    }, 'span, a');

    const boldNode = cssNode.add('Bold', { "font-size": "120%" }, 'strong');

    expect(boldNode.fullSelector).toBe('span strong, a strong');
    expect(cssNode.stylesheet()).toBe(`span, a {
\tfont-family: Tahoma, sans-serif;
}

span strong, a strong {
\tfont-size: 120%;
}`);
})

test('Stylesheet Test w/ Children and Pseduoelements', () => {
    const cssNode = new CssNode('Text Field', {
        "font-family": "Tahoma, sans-serif"
    }, 'span');

    let after = cssNode.add('::after', { "content": '","' });
    cssNode.add('Bold', { "font-size": "120%" }, 'strong');

    expect(after.fullSelector).toBe('span::after');
    expect(cssNode.stylesheet()).toBe(`span {
\tfont-family: Tahoma, sans-serif;
}

span::after {
\tcontent: ",";
}

span strong {
\tfont-size: 120%;
}`);
})