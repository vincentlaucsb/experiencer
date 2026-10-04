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

test.each([undefined, [], [''], ['   ']])('read-only entries omit empty subtitle headings %p', subtitle => {
    const { container } = render(<Entry id={[0]} type={Entry.type} uuid="empty-subtitle" isLast={false}
        readOnly title={['Some Company']} subtitle={subtitle} updateData={() => {}} updateDataFields={() => {}} />);
    expect(container.querySelector('h3.title')).not.toBeNull();
    expect(container.querySelector('h4.subtitle')).toBeNull();
});

test('read-only entries omit add controls and empty-field hints while editing', () => {
    const uuid = 'printing-entry';
    act(() => {
        useEditorStore.getState().editNode(uuid);
    });

    const { container } = render(<Entry
        id={[0]}
        type={Entry.type}
        uuid={uuid}
        isLast={false}
        readOnly
        updateData={() => { }}
        updateDataFields={() => { }}
        title={['', 'QA Overflow Entry']}
        subtitle={['', 'Visible role']}
    />);

    expect(container.textContent).toContain('QA Overflow Entry');
    expect(container.textContent).toContain('Visible role');
    expect(container.textContent).not.toContain('Enter a value');
    expect(screen.queryByRole('button', { name: 'Add title' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Add detail' })).toBeNull();
    expect(container.querySelectorAll('.title .field')).toHaveLength(1);
    expect(container.querySelector('.title .field-0')?.textContent).toBe('QA Overflow Entry');
    expect(container.querySelector('.title .field-middle')).toBeNull();
    expect(container.querySelector('.title .field-last')).toBeNull();
    expect(container.querySelector('h3.title')?.textContent).toBe('QA Overflow Entry');
    expect(container.querySelector('article.entry')?.className).toBe('entry');
});

test('read-only entries renumber visible subtitle fields and keep a break from a blank slot', () => {
    const { container } = render(<Entry
        id={[0]}
        type={Entry.type}
        uuid="printing-breaks"
        isLast={false}
        readOnly
        updateData={() => { }}
        updateDataFields={() => { }}
        title={['Company']}
        subtitle={['Role', '', 'City']}
        subtitleBreaks={[1]}
    />);

    const subtitle = container.querySelector('h4.subtitle');
    expect(subtitle?.querySelector('.field-0')?.textContent).toBe('Role');
    expect(subtitle?.querySelector('.field-last')?.textContent).toBe('City');
    expect(subtitle?.querySelector('.field-middle')).toBeNull();
    const children = subtitle ? Array.from(subtitle.children).map((element) => element.tagName) : [];
    expect(children).toEqual(['SPAN', 'HR', 'SPAN']);
});

test('read-only entries retain populated subtitle headings', () => {
    const { container } = render(<Entry id={[0]} type={Entry.type} uuid="populated-subtitle" isLast={false}
        readOnly title={['Some Company']} subtitle={['Some Job']} updateData={() => {}} updateDataFields={() => {}} />);
    expect(container.querySelector('h4.subtitle')?.textContent).toBe('Some Job');
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

test("editing entries keep title and detail controls in one action row", () => {
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
    expect(addTitleButton.className).toContain("pure-button-primary");
    expect(addTitleButton.closest('.entry-field-actions')).toBe(addDetailButton.closest('.entry-field-actions'));
    expect(addTitleButton.closest('hgroup')).toBeNull();
    expect(addTitleButton.textContent).toContain('Add title');
});
