import { fireEvent, render, screen } from "@testing-library/react";

import TextField from "@/controls/inputs/TextField";
import { HintKey, hintStore } from "@/shared/stores/hintStore";

afterEach(() => {
    hintStore.reset();
});

test("auto-expands inline editors by default", () => {
    render(
        <TextField
            value="A long resume field"
            onChange={jest.fn()}
        />
    );

    fireEvent.click(screen.getByText("A long resume field"));
    const input = screen.getByDisplayValue("A long resume field") as HTMLInputElement;
    Object.defineProperty(input, "scrollWidth", { configurable: true, value: 240 });

    fireEvent.input(input);

    expect(input.style.width).toBe("240px");
});

test("supports an explicit fixed-width opt-out", () => {
    render(
        <TextField
            value="A fixed utility field"
            autoExpand={false}
            onChange={jest.fn()}
        />
    );

    fireEvent.click(screen.getByText("A fixed utility field"));
    expect(screen.getByDisplayValue("A fixed utility field").style.width).toBe("");
});

test("opens the same field menu from the visible options affordance and dismisses its hint", () => {
    render(
        <TextField
            value="A discoverable field"
            showContextMenuButton
            contextMenuOptions={[{ text: "Delete field", onClick: jest.fn() }]}
            onChange={jest.fn()}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "More options for A discoverable field" }));

    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Delete field" })).toBeTruthy();
    expect(hintStore.isDismissed(HintKey.FieldOptions)).toBe(true);
});

test("dismisses the field-options hint after the first field context menu", () => {
    render(
        <TextField
            value="A context-menu field"
            showContextMenuButton
            onChange={jest.fn()}
        />
    );

    fireEvent.contextMenu(screen.getByText("A context-menu field"));

    expect(hintStore.isDismissed(HintKey.FieldOptions)).toBe(true);
});
