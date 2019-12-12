import { assignIds } from "./Helpers";

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