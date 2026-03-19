/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import Column from "@/resume/Column";
import Group from "@/resume/Group";
import Header from "@/resume/Header";
import MarkdownText from "@/resume/Markdown";
import Row from "@/resume/Row";
import Section from "@/resume/Section";

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

    test("Row supports default children plus Column and Group", () => {
        const rowChildren = ComponentTypes.instance.childTypes(Row.type);

        expect(Array.isArray(rowChildren)).toBe(true);

        const rowChildTypes = rowChildren as string[];
        expect(rowChildTypes).toContain(MarkdownText.type);
        expect(rowChildTypes).toContain(Column.type);
        expect(rowChildTypes).toContain(Group.type);
    });

    test("container types allow Group as a child", () => {
        const sectionChildren = ComponentTypes.instance.childTypes(Section.type) as string[];
        const headerChildren = ComponentTypes.instance.childTypes(Header.type) as string[];

        expect(sectionChildren).toContain(Group.type);
        expect(headerChildren).toContain(Group.type);
    });

    test("Group supports layout children like Row", () => {
        const groupChildren = ComponentTypes.instance.childTypes(Group.type) as string[];

        expect(groupChildren).toContain(Row.type);
        expect(groupChildren).toContain(Column.type);
    });
});
