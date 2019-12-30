import { assignIds, process, arraysEqual } from "./Helpers";
import { BasicResumeNode } from "./utility/NodeTree";

test('assignIDs Test', async () => {
    const node = {
        type: 'FlexibleRow',
        childNodes: [
            { type: 'FlexibleColumn' },
            { type: 'FlexibleColumn' }
        ]
    } as BasicResumeNode;

    // Assign unique IDs
    assignIds(node);

    // Test
    const topId = node['uuid'];
    expect(topId).toBeDefined();

    // Test that IDs are unique
    expect(node.childNodes).toBeDefined();
    if (node.childNodes) {
        node.childNodes.forEach(
            (child) => {
                expect(child['uuid']).not.toBe(topId);
                expect(child['uuid']).toBeDefined();
            }
        );

        expect(node.childNodes[0]['uuid']).not.toBe(node.childNodes[1]['uuid']);
    }
});

test('Helpers Test', async () => {
    let left = [0, 1, 0];
    let right = [0, 1, 1];

    expect(arraysEqual(left, right)).toBeFalsy();
});

test('process Test', async () => {
    const textWithNdash = "January 2014 -- December 2016"
    expect(process(textWithNdash)).toBe("January 2014 \u2013 December 2016");

    const textWithMdash = "January 2014 --- December 2016"
    expect(process(textWithMdash)).toBe("January 2014 \u2014 December 2016");
});