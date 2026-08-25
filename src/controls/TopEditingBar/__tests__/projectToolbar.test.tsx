import registerNodes from "@/resume/schema";
import Section from "@/resume/Section";
import { assignIds } from "@/shared/utils/assignIds";
import type { NodeProperty } from "@/types";
import PageSize from "@/types/PageSize";

import { projectToolbar } from "../projectToolbar";
import type { TopEditingBarViewProps } from "../types";

registerNodes();

function createProps(): TopEditingBarViewProps {
    return {
        addHtmlId: jest.fn(),
        addCssClasses: jest.fn(),
        addChild: jest.fn(),
        updateSelected: jest.fn((_key: string, _value: NodeProperty) => undefined),
        unselect: jest.fn(),
        copyClipboard: jest.fn(),
        cutClipboard: jest.fn(),
        delete: jest.fn(),
        moveUp: jest.fn(),
        moveDown: jest.fn(),
        duplicateBefore: jest.fn(),
        duplicateAfter: jest.fn(),
        pasteClipboard: jest.fn(),
        saveLocal: jest.fn(),
        undo: jest.fn(),
        redo: jest.fn(),
        pageSize: PageSize.Letter,
        setPageSize: jest.fn()
    };
}

test("projects root sections before appended product sections", () => {
    const props = createProps();
    props.additionalToolbarSections = new Map([
        ["AI Review", { items: [{ text: "Review", onClick: jest.fn() }] }]
    ]);

    const data = projectToolbar(props, jest.fn());

    expect([...data.keys()]).toEqual([
        "Editing",
        "Page Setup",
        "Clipboard",
        "Resume",
        "AI Review"
    ]);
    expect(data.get("Page Setup")?.items[0].content).toBeTruthy();
    expect(data.get("Page Setup")?.collapsedItems?.map((item) => item.text)).toEqual([
        "Letter ✓",
        "A4"
    ]);
});

test("preserves Map position when an extension replaces a duplicate section name", () => {
    const props = createProps();
    props.additionalToolbarSections = new Map([
        ["Editing", { items: [{ text: "Replacement", onClick: jest.fn() }] }]
    ]);

    const data = projectToolbar(props, jest.fn());

    expect([...data.keys()][0]).toBe("Editing");
    expect(data.get("Editing")?.items[0].text).toBe("Replacement");
});

test("projects selected-node sections without root-only controls", () => {
    const selectedNode = assignIds({ type: Section.type });
    const data = projectToolbar({ ...createProps(), selectedNode }, jest.fn());

    expect([...data.keys()]).toEqual([
        "Editing",
        "Current Node (Section)",
        "Move",
        "CSS"
    ]);
    expect(data.has("Page Setup")).toBe(false);
    expect(data.has("Resume")).toBe(false);
});
