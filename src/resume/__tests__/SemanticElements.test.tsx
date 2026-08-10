/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";
import Column from "../Column";
import Entry from "../Entry";
import Grid from "../Grid";
import Group from "../Group";
import PageBreak from "../PageBreak";
import Row from "../Row";

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
