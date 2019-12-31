import ObservableResumeNodeTree from "./ObservableResumeNodeTree";
import { ResumeNode } from "./Types";
import { assignIds } from "../Helpers";

/** Test undo/redo functionality */
test('Undo/Redo Test', async () => {
    let startingNodes: Array<ResumeNode> = assignIds([
        {
            // [0]
            type: 'Header'
        },
        {
            // [1]
            type: 'Grid',
            childNodes: [
                // [1, 0]
                {
                    type: 'Column'
                },

                // [1, 1]
                {
                    type: 'Column'
                }
            ]
        }
    ]);

    const tree = new ObservableResumeNodeTree();
    tree.childNodes = startingNodes;

    // Delete Header
    tree.deleteChild([0]);
    expect(tree.getNodeById([0]).type).toBe('Grid');

    // Undo
    tree.undo();
    expect(tree.getNodeById([0]).type).toBe('Header');

    // Redo
    tree.redo();
    expect(tree.getNodeById([0, 1]).type).toBe('Column');
});