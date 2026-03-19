/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import MarkdownText from "@/resume/Markdown";

describe("schema childTypes", () => {
    beforeAll(() => {
        registerNodes();
    });

    test("Markdown explicitly has no allowed children", () => {
        expect(ComponentTypes.instance.childTypes(MarkdownText.type)).toEqual([]);
    });

    test("childTypes: [] does not fall back to default child types", () => {
        const schema = ComponentTypes.instance;
        const suffix = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
        const defaultType = `DefaultType-${suffix}`;
        const leafType = `LeafType-${suffix}`;

        schema.registerNodeType({
            component: MarkdownText,
            type: defaultType,
            text: "Default Type",
            isDefaultChildType: true,
            defaultValue: {},
        });

        schema.registerNodeType({
            component: MarkdownText,
            type: leafType,
            text: "Leaf Type",
            childTypes: [],
            defaultValue: {},
        });

        expect(schema.childTypes(leafType)).toEqual([]);
    });
});
