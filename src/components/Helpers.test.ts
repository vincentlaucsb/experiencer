import { isNullOrUndefined } from "util";
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
    expect(!isNullOrUndefined(node['uuid']));
});