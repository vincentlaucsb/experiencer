/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import { useEditorStore } from "@/shared/stores/editorStore";
import MarkdownText from "../Markdown";
import Column from "../Column";
import Entry from "../Entry";
import Grid from "../Grid";
import Group from "../Group";
import Header from "../Header";
import PageBreak from "../PageBreak";
import Row from "../Row";
import { DescriptionListItem, DescriptionListItemType } from "../List";
import Section from "../Section";

const nodeProps = (type: string, uuid: string) => ({
    id: [0],
    uuid,
    type,
    isLast: false,
    childNodes: [],
    updateData: jest.fn(),
    updateDataFields: jest.fn()
});

test("layout nodes render standard HTML with canonical styling classes", () => {
    const { container } = render(
        <>
            <Grid {...nodeProps(Grid.type, "grid")} />
            <Column {...nodeProps(Column.type, "column")} />
            <Row {...nodeProps(Row.type, "row")} />
            <Entry {...nodeProps(Entry.type, "entry")} title={["Company"]} />
            <Group {...nodeProps(Group.type, "group")} />
            <PageBreak {...nodeProps(PageBreak.type, "page-break")} />
        </>
    );

    expect(container.querySelector(".grid-container")?.tagName).toBe("DIV");
    expect(container.querySelector(".column")?.tagName).toBe("DIV");
    expect(container.querySelector(".row")?.tagName).toBe("DIV");
    expect(container.querySelector(".entry")?.tagName).toBe("ARTICLE");
    expect(container.querySelector('[data-uuid="group"]')?.tagName).toBe("DIV");
    expect(container.querySelector(".page-break")?.tagName).toBe("DIV");
    expect(container.innerHTML).not.toMatch(/<\/?resume-[a-z-]+/);
});

test("read-only empty header and section omit editor placeholders", () => {
    const { container } = render(
        <>
            <Header {...nodeProps(Header.type, "header")} value="" subtitle="" readOnly />
            <Section {...nodeProps(Section.type, "section")} value="" readOnly />
            <Grid {...nodeProps(Grid.type, "readonly-grid")} readOnly />
        </>
    );

    expect(container.textContent).not.toContain("Enter a title");
    expect(container.textContent).not.toContain("Click here");
});

test("read-only empty markdown and rows leave no editor chrome", () => {
    useEditorStore.getState().editNode("empty-markdown");
    const markdown = render(
        <MarkdownText {...nodeProps(MarkdownText.type, "empty-markdown")} value="" readOnly />
    );
    expect(markdown.container.querySelector(".text-content")?.textContent).toBe("");
    expect(markdown.container.textContent).not.toContain("Click to add content");
    expect(document.body.textContent).not.toContain("Save (Ctrl + Enter)");
    markdown.unmount();
    useEditorStore.getState().unselectNode();

    const row = render(<Row {...nodeProps(Row.type, "empty-row")} readOnly />);
    expect((row.container.querySelector(".row") as HTMLElement).style.minHeight).toBe("");
    expect((row.container.querySelector(".row") as HTMLElement).style.minWidth).toBe("");
});

test("read-only columns omit the empty-column hint", () => {
    const { container } = render(
        <Column {...nodeProps(Column.type, "empty-column")} readOnly />
    );

    expect(container.textContent).not.toContain("Click to select");
    expect((container.querySelector(".column") as HTMLElement).style.minWidth).toBe("");
    expect((container.querySelector(".column") as HTMLElement).style.minHeight).toBe("");
});

test("read-only description items omit empty-field hints", () => {
    const { container } = render(
        <DescriptionListItem
            {...nodeProps(DescriptionListItemType, "definition")}
            value=""
            definitions={["", "Real definition"]}
            readOnly
        />
    );

    expect(container.textContent).toContain("Real definition");
    expect(container.textContent).not.toContain("Enter a term");
    expect(container.textContent).not.toContain("Enter a value");
});

test("editable empty section keeps its selection hint", () => {
    const { container } = render(
        <Section {...nodeProps(Section.type, "editable-section")} value="" />
    );

    expect(container.textContent).toContain("Enter a title");
    expect(container.textContent).toContain("This section is empty. Click here to select it and add content.");
});
