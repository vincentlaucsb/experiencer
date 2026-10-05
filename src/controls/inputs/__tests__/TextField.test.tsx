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

describe("a draft the parent rejects", () => {
    function renderRejecting() {
        const onChange = jest.fn();
        const view = render(<TextField value="body a" displayClassName="before" onChange={onChange} />);
        fireEvent.click(screen.getByText("body a"));
        fireEvent.change(screen.getByDisplayValue("body a"), { target: { value: "#resume a" } });
        // An unrelated parent render that leaves the rejected value in place.
        const rerender = () => view.rerender(<TextField value="body a" displayClassName="after" onChange={onChange} />);
        return { onChange, rerender };
    }

    test("is submitted once on Enter, not again on later renders", () => {
        const { onChange, rerender } = renderRejecting();

        fireEvent.keyDown(screen.getByDisplayValue("#resume a"), { key: "Enter" });
        rerender();

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith("#resume a");
    });

    test("is submitted once on blur, not again on later renders", () => {
        const { onChange, rerender } = renderRejecting();

        fireEvent.blur(screen.getByDisplayValue("#resume a"));
        rerender();

        expect(onChange).toHaveBeenCalledTimes(1);
    });

    test("can be submitted again from a new edit", () => {
        const { onChange } = renderRejecting();

        fireEvent.keyDown(screen.getByDisplayValue("#resume a"), { key: "Enter" });
        fireEvent.click(screen.getByText("body a"));
        fireEvent.change(screen.getByDisplayValue("#resume a"), { target: { value: "#resume a" } });
        fireEvent.keyDown(screen.getByDisplayValue("#resume a"), { key: "Enter" });

        expect(onChange).toHaveBeenCalledTimes(2);
    });
});

test("retains precise field actions in the right-click menu", () => {
    render(
        <TextField
            value="A discoverable field"
            contextMenuOptions={[{ text: "Delete field", onClick: jest.fn() }]}
            onChange={jest.fn()}
        />
    );

    fireEvent.contextMenu(screen.getByText("A discoverable field"));

    expect(screen.getByRole("menuitem", { name: "Edit" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Delete field" })).toBeTruthy();
});
