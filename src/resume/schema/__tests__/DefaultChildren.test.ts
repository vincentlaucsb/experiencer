/**
 * @jest-environment jsdom
 */
import DefaultChildren from "@/resume/schema/DefaultChildren";

describe("DefaultChildren", () => {
    test("resolves defaults plus explicit additions", () => {
        const resolved = DefaultChildren.create()
            .plus("Column")
            .resolve(["Section", "Markdown"]);

        expect(resolved).toEqual(["Column", "Section", "Markdown"]);
    });

    test("supports minus and preserves operation order", () => {
        const resolved = DefaultChildren.create()
            .minus("Markdown")
            .plus("Markdown")
            .resolve(["Section", "Markdown", "Link"]);

        expect(resolved).toEqual(["Markdown", "Section", "Link"]);
    });

    test("does not duplicate existing types", () => {
        const resolved = DefaultChildren.create()
            .plus(["Section", "Column", "Column"])
            .resolve(["Section", "Markdown"]);

        expect(resolved).toEqual(["Section", "Column", "Markdown"]);
    });
});
