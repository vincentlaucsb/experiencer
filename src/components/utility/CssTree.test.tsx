import CssNode from "./CssTree";

test('findNode Test', () => {
    const cssNode = CssNode.load({
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

    const listCss = cssNode.findNode(['Lists']) as CssNode;
    const listItemCss = cssNode.findNode(['Lists', 'List Item']) as CssNode;

    expect(listCss).toBeDefined();
    expect(listCss.fullSelector).toEqual('.rich-text ul');

    expect(listItemCss).toBeDefined();
    expect(listItemCss.fullSelector).toEqual('.rich-text ul li');
})