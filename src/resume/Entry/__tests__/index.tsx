/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import Entry from "../";
import { useEditorStore } from "@/shared/stores/editorStore";

function StatefulEntry({ uuid }: { uuid: string }) {
    const [title, setTitle] = useState(["Some Company"]);
    const [subtitle, setSubtitle] = useState(["Some Job Title"]);

    return <Entry
        id={[0]}
        type={Entry.type}
        uuid={uuid}
        isLast={false}
        updateData={(key, value) => {
            if (key === "title") {
                setTitle(value as string[]);
            }
            if (key === "subtitle") {
                setSubtitle(value as string[]);
            }
        }}
        updateDataFields={() => { }}
        title={title}
        subtitle={subtitle}
    />;
}

afterEach(() => {
    act(() => {
        useEditorStore.getState().unselectNode();
    });
});

/** Assert that the correct class names are generated */
test('Entry Class Names Test', async () => {
    const title = ["Some Company"];
    const subtitle = ["Some Job Title", "Some Town, USA", "2016"];

    const { container } = render(<Entry
        id={[0]}
        type={Entry.type}
        uuid=""
        isLast={false}
        updateData={() => { }}
        updateDataFields={() => { }}
        title={title}
        subtitle={subtitle}
        subtitleBreaks={[1]}
    />);

    const entryRoot = container.querySelector('article.entry');
    expect(entryRoot).not.toBeNull();
    expect(entryRoot?.classList.contains('entry--selected')).toBe(false);

    const subtitleContainer = container.querySelector('.subtitle') as Element;
    const titleContainer = container.querySelector('.title') as Element;

    expect(titleContainer.querySelectorAll('hr')).toHaveLength(0);
    expect(subtitleContainer.querySelectorAll('hr')).toHaveLength(1);

    const allSubtitleFields = subtitleContainer.querySelectorAll('.field');
    expect(allSubtitleFields).not.toBeNull();

    if (allSubtitleFields) {
        expect(allSubtitleFields.length === subtitle.length);
    }

    const firstField = subtitleContainer.querySelector('.field-0');
    expect(firstField).not.toBeNull();

    if (firstField) {
        expect(firstField.textContent).toBe("Some Job Title");
    }

    const middleField = subtitleContainer.querySelector('.field.field-middle');
    expect(middleField).not.toBeNull();

    if (middleField) {
        expect(middleField.textContent).toBe("Some Town, USA");
    }

    const lastField = subtitleContainer.querySelector('.field.field-last');
    expect(lastField).not.toBeNull();

    if (lastField) {
        expect(lastField.textContent).toBe("2016");
    }
})

test("selected entries expose direct title and detail actions", () => {
    const uuid = "selected-entry";

    act(() => {
        useEditorStore.getState().selectNode(uuid);
    });

    const { container } = render(<StatefulEntry uuid={uuid} />);

    expect(container.querySelector('article.entry')?.classList.contains('entry--selected')).toBe(true);

    act(() => {
        screen.getByRole("button", { name: "Add title" }).click();
    });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(container.querySelectorAll('.title .field')).toHaveLength(1);
    expect(container.querySelectorAll('.title input')).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Add detail" })).toBeTruthy();
    expect(container.querySelector("[data-field-options-trigger]")).toBeNull();
});

test("editing entries expose compact title and detail controls", () => {
    const uuid = "editing-entry";

    act(() => {
        useEditorStore.getState().editNode(uuid);
    });

    render(<Entry
        id={[0]}
        type={Entry.type}
        uuid={uuid}
        isLast={false}
        updateData={() => { }}
        updateDataFields={() => { }}
        title={["Some Company"]}
        subtitle={["Some Job Title"]}
    />);

    expect(document.querySelector("[data-field-options-trigger]")).toBeNull();
    const addTitleButton = screen.getByRole("button", { name: "Add title" });
    const addDetailButton = screen.getByRole("button", { name: "Add detail" });
    expect(addTitleButton.className).toContain("entry-field-adder__trigger");
    expect(addTitleButton.className).toContain("pure-button-primary");
    expect(addTitleButton.className).toContain("pure-button-outline");
    expect(addDetailButton.className).toContain("pure-button-outline");
});
