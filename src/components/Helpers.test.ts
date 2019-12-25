import { assignIds, process, arraysEqual } from "./Helpers";

test('assignIDs Test', () => {
    const node = {
        type: 'FlexibleRow',
        children: [
            { type: 'FlexibleColumn' },
            { type: 'FlexibleColumn' }
        ]
    };

    // Assign unique IDs
    assignIds(node);

    // Test
    const topId = node['uuid'];
    expect(topId).toBeDefined();

    // Test that IDs are unique
    node.children.forEach(
        (child) => {
            expect(child['uuid']).not.toBe(topId);
            expect(child['uuid']).toBeDefined();
        }
    );

    expect(node.children[0]['uuid']).not.toBe(node.children[1]['uuid']);
});

test('Helpers Test', () => {
    let left = [0, 1, 0];
    let right = [0, 1, 1];

    expect(arraysEqual(left, right)).toBeFalsy();
});

test('process Test', () => {
    const textWithNdash = "January 2014 -- December 2016"
    expect(process(textWithNdash)).toBe("January 2014 \u2013 December 2016");

    const textWithMdash = "January 2014 --- December 2016"
    expect(process(textWithMdash)).toBe("January 2014 \u2014 December 2016");
});