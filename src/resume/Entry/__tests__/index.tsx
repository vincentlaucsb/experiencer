/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";
import { useState } from "react";
import Entry from "../";
import { useEditorStore } from "@/shared/stores/editorStore";

function StatefulEntry({ uuid }: { uuid: string }) {
    const [subtitle, setSubtitle] = useState(["Some Job Title"]);

    return <Entry
        id={[0]}
        type={Entry.type}
        uuid={uuid}
        isLast={false}
        updateData={(key, value) => {
            if (key === "subtitle") {
                setSubtitle(value as string[]);
            }
        }}
        updateDataFields={() => { }}
        title={["Some Company"]}
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
    />);

    const entryRoot = container.querySelector('article.entry');
    expect(entryRoot).not.toBeNull();

    const subtitleContainer = container.querySelector('.subtitle') as Element;

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

test("selected entries expose a direct add-field action", () => {
    const uuid = "selected-entry";

    act(() => {
        useEditorStore.getState().selectNode(uuid);
    });

    render(<StatefulEntry uuid={uuid} />);

    act(() => {
        screen.getByRole("button", { name: "Add field" }).click();
    });

    expect(screen.queryByRole("menu")).toBeNull();
    expect(screen.getByRole("textbox")).toBeTruthy();
    expect(screen.getByText("Right-click fields for more options")).toBeTruthy();
});

test("editing entries expose a compact add-field control", () => {
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

    expect(screen.getByText("Finish editing to see field options")).toBeTruthy();
    const addFieldButton = screen.getByRole("button", { name: "Add field" });
    expect(addFieldButton.className).toContain("entry-field-adder__trigger");
    expect(addFieldButton.className).toContain("pure-button-primary");
    expect(addFieldButton.className).toContain("pure-button-outline");
});
