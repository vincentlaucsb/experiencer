import CssNode from "@/shared/CssTree";
import { createCssEditorCommands } from "@/shared/stores/cssEditorCommands";
import type { LiveCssTreeChange } from "@/shared/utils/liveCssSync";

function createFixture() {
    const root = new CssNode("Resume CSS", { color: "black" }, "body");
    root.addNode("Entry", { display: "block" }, ".entry");
    const updateTree = jest.fn((updater: (tree: CssNode) => void) => updater(root));
    return {
        commands: createCssEditorCommands(updateTree),
        root,
        updateTree
    };
}

describe("CSS editor commands", () => {
    test("routes every authored CSS mutation through the supplied tree update", () => {
        const { commands, root, updateTree } = createFixture();

        commands.addSelector(["Entry"], "Emphasis", "strong");
        commands.updateDescription(["Entry", "Emphasis"], "Makes text bold");
        commands.updateSelector(["Entry", "Emphasis"], "b");
        commands.updateProperty(["Entry", "Emphasis"], "font-weight", "700");
        commands.deleteKey(["Entry", "Emphasis"], "font-weight");

        const node = root.mustFindNode(["Entry", "Emphasis"]);
        expect(node.description).toBe("Makes text bold");
        expect(node.selector).toBe("b");
        expect(node.properties.has("font-weight")).toBe(false);

        commands.updateName(["Entry", "Emphasis"], "Strong text");
        expect(node.name).toBe("Strong text");

        commands.deleteNode(["Entry", "Emphasis"]);
        expect(root.mustFindNode(["Entry"]).children).toHaveLength(0);
        expect(updateTree).toHaveBeenCalledTimes(7);
    });

    test("replaces a selected subtree in one store update", () => {
        const { commands, root, updateTree } = createFixture();
        root.mustFindNode(["Entry"]).addNode("Title", { color: "black" }, "h2");
        const changes: LiveCssTreeChange[] = [
            {
                status: "changed",
                name: "Entry",
                path: ["Entry"],
                selector: "body .entry",
                previousDeclarations: new Map([["display", "block"]]),
                declarations: new Map([["display", "grid"]]),
                added: [],
                changed: ["display"],
                removed: []
            },
            {
                status: "changed",
                name: "Title",
                path: ["Entry", "Title"],
                selector: "body .entry h2",
                previousDeclarations: new Map([["color", "black"]]),
                declarations: new Map([["color", "navy"]]),
                added: [],
                changed: ["color"],
                removed: []
            }
        ];

        commands.replaceProperties(changes);

        expect(root.mustFindNode(["Entry"]).properties.get("display")).toBe("grid");
        expect(root.mustFindNode(["Entry", "Title"]).properties.get("color")).toBe("navy");
        expect(updateTree).toHaveBeenCalledTimes(1);
    });

    test.each(["addSelector", "updateSelector"] as const)(
        "rejects invalid selectors before %s can create an update",
        (commandName) => {
        const root = new CssNode("Resume CSS", {}, "body");
        const updateTree = jest.fn((updater: (tree: CssNode) => void) => updater(root));
        const reportError = jest.fn();
        const commands = createCssEditorCommands(updateTree, reportError);

        if (commandName === "addSelector") {
            commands.addSelector([], "Reserved", "#resume");
        } else {
            commands.updateSelector([], "#resume .entry");
        }

        expect(updateTree).not.toHaveBeenCalled();
        expect(reportError).toHaveBeenCalledWith("#resume is reserved for Experiencer's editor host.");
        }
    );
});
