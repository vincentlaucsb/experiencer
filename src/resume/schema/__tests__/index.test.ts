/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import ComponentTypes from "@/resume/schema/ComponentTypes";
import Column from "@/resume/Column";
import Entry from "@/resume/Entry";
import Group from "@/resume/Group";
import Header from "@/resume/Header";
import { DescriptionListItemType, DescriptionListType } from "@/resume/List";
import Link from "@/resume/Link";
import MarkdownText from "@/resume/Markdown";
import PageBreak from "@/resume/PageBreak";
import Row from "@/resume/Row";
import Section from "@/resume/Section";
import { ResumeNode } from "@/types";

describe("schema childTypes", () => {
    beforeAll(() => {
        registerNodes();
    });

    test("Markdown explicitly has no allowed children", () => {
        expect(ComponentTypes.instance.childTypes(MarkdownText.type)).toEqual([]);
    });

    test("DescriptionList only allows DescriptionListItem", () => {
        expect(ComponentTypes.instance.childTypes(DescriptionListType)).toEqual([DescriptionListItemType]);
    });

    test("DescriptionListItem explicitly has no allowed children", () => {
        expect(ComponentTypes.instance.childTypes(DescriptionListItemType)).toEqual([]);
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

    test("Resume root allows all registered types except DescriptionListItem", () => {
        const rootChildren = ComponentTypes.instance.childTypes("Resume") as string[];

        expect(rootChildren).toContain(Section.type);
        expect(rootChildren).toContain(Row.type);
        expect(rootChildren).toContain(Column.type);
        expect(rootChildren).toContain(PageBreak.type);
        expect(rootChildren).not.toContain(DescriptionListItemType);
    });

    test("tree class names come from registration metadata", () => {
        expect(ComponentTypes.instance.treeClassNames(Entry.type)).toEqual(["tree-item-entry"]);
        expect(ComponentTypes.instance.treeClassNames(Section.type)).toEqual(["tree-item-section"]);
        expect(ComponentTypes.instance.treeClassNames(Header.type)).toEqual([`tree-item-${Header.type}`]);
    });

    test("tree representation supports custom and fallback labels", () => {
        const entryNode = {
            type: Entry.type,
            uuid: "entry-1",
            title: ["Acme Corp"]
        } as ResumeNode;

        const sectionNode = {
            type: Section.type,
            uuid: "section-1",
            value: "Experience"
        } as ResumeNode;

        const headerNode = {
            type: Header.type,
            uuid: "header-1"
        } as ResumeNode;

        expect(ComponentTypes.instance.treeRepresentation(entryNode)).toBe("Acme Corp");
        expect(ComponentTypes.instance.treeRepresentation(sectionNode)).toBe("Experience");
        expect(ComponentTypes.instance.treeRepresentation(headerNode)).toBe(Header.type);
    });

    test("tree representation for Link prefers value then url", () => {
        const linkWithValue = {
            type: Link.type,
            uuid: "link-1",
            value: "GitHub",
            url: "https://github.com/example"
        } as ResumeNode;

        const linkWithoutValue = {
            type: Link.type,
            uuid: "link-2",
            url: "https://example.com"
        } as ResumeNode;

        expect(ComponentTypes.instance.treeRepresentation(linkWithValue)).toBe("GitHub");
        expect(ComponentTypes.instance.treeRepresentation(linkWithoutValue)).toBe("https://example.com");
    });

    test("tree representation for Image prefers altText then value", () => {
        const imageWithAlt = {
            type: "Image",
            uuid: "image-1",
            altText: "Signature",
            value: "data:image/png;base64,abc"
        } as ResumeNode;

        const imageWithoutAlt = {
            type: "Image",
            uuid: "image-2",
            value: "https://example.com/photo.png"
        } as ResumeNode;

        expect(ComponentTypes.instance.treeRepresentation(imageWithAlt)).toBe("Signature");
        expect(ComponentTypes.instance.treeRepresentation(imageWithoutAlt)).toBe("https://example.com/photo.png");
    });
});
