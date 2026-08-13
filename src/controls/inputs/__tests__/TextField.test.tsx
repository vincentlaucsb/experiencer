import { fireEvent, render, screen } from "@testing-library/react";

import TextField from "@/controls/inputs/TextField";

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
