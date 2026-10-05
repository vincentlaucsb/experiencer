/**
 * @jest-environment jsdom
 */
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import MappedTextFields from "@/controls/inputs/MappedTextFields";

function validate(key: string, value: string) {
    if (key.includes(";") || /\s/.test(key)) return "bad name";
    if (value === "notacolor") return "bad value";
    return undefined;
}

function renderFields(updateValue = jest.fn(), deleteKey = jest.fn(), removable = false) {
    if (removable) {
        function Harness() {
            const [entries, setEntries] = React.useState(new Map([["color", "var(--text-color)"]]));
            return (
                <MappedTextFields
                    value={entries}
                    updateValue={(key, next) => {
                        updateValue(key, next);
                        setEntries(current => new Map(current).set(key, next));
                    }}
                    deleteKey={(key) => {
                        deleteKey(key);
                        setEntries(current => {
                            const next = new Map(current);
                            next.delete(key);
                            return next;
                        });
                    }}
                    validateValue={validate}
                    keySuggestions={["margin", "color"]}
                    container={({ children, onClick }) => (
                        <table onClick={onClick}><tbody>{children}</tbody></table>
                    )}
                />
            );
        }
        render(<Harness />);
        return { updateValue, deleteKey };
    }
    render(
        <MappedTextFields
            value={new Map([["color", "var(--text-color)"]])}
            updateValue={updateValue}
            deleteKey={deleteKey}
            validateValue={validate}
            keySuggestions={["margin", "color"]}
            container={({ children, onClick }) => (
                <table onClick={onClick}><tbody>{children}</tbody></table>
            )}
        />
    );
    return { updateValue, deleteKey };
}

/** Renders a rule with several declarations whose store applies every commit. */
function renderRule(updateValue = jest.fn(), deleteKey = jest.fn()) {
    function Harness() {
        const [entries, setEntries] = React.useState(new Map([
            ["color", "navy"],
            ["text-decoration", "none"]
        ]));
        return (
            <MappedTextFields
                value={entries}
                updateValue={(key, next) => {
                    updateValue(key, next);
                    setEntries(current => new Map(current).set(key, next));
                }}
                deleteKey={(key) => {
                    deleteKey(key);
                    setEntries(current => {
                        const next = new Map(current);
                        next.delete(key);
                        return next;
                    });
                }}
                validateValue={validate}
                container={({ children, onClick }) => (
                    <table onClick={onClick}><tbody>{children}</tbody></table>
                )}
            />
        );
    }
    render(<Harness />);
    return { updateValue, deleteKey };
}

function commit(label: string, value: string, key = "Enter") {
    const input = screen.getByLabelText(label);
    fireEvent.change(input, { target: { value } });
    fireEvent.keyDown(input, { key });
}

describe("mapped CSS declarations", () => {
    test("clears an existing value by removing the declaration", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByText("var(--text-color)"));
        commit("color value", "");

        expect(deleteKey).toHaveBeenCalledWith("color");
        expect(updateValue).not.toHaveBeenCalled();
    });

    test("treats a whitespace-only value as empty", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByText("var(--text-color)"));
        commit("color value", "   ");

        expect(deleteKey).toHaveBeenCalledWith("color");
        expect(updateValue).not.toHaveBeenCalled();
    });

    test("keeps an invalid draft out of the document", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByText("var(--text-color)"));
        commit("color value", "notacolor");

        expect(screen.getByRole("alert").textContent).toContain("bad value");
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("does not store a new property until it has a value", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "margin");
        expect(updateValue).not.toHaveBeenCalled();
        expect((screen.getByLabelText("margin value") as HTMLInputElement).value).toBe("");

        fireEvent.keyDown(screen.getByLabelText("margin value"), { key: "Escape" });

        expect(screen.queryByLabelText("margin value")).toBeNull();
        expect(screen.queryByText("margin")).toBeNull();
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("cancels a typed property name on Escape", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        fireEvent.change(screen.getByLabelText("New property name value"), { target: { value: "margin" } });
        fireEvent.keyDown(screen.getByLabelText("New property name value"), { key: "Escape" });

        expect(screen.queryByLabelText("margin value")).toBeNull();
        expect(screen.queryByText("margin")).toBeNull();
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("does not save a draft when Escape is pressed on the delete button", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByText("var(--text-color)"));
        fireEvent.change(screen.getByLabelText("color value"), { target: { value: "blue" } });
        fireEvent.keyDown(screen.getByRole("button", { name: "Delete property color" }), { key: "Escape" });

        expect(screen.getByText("var(--text-color)")).toBeTruthy();
        expect(screen.queryByLabelText("color value")).toBeNull();
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("does not save a new property when Escape is pressed on its delete button", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "margin");
        fireEvent.change(screen.getByLabelText("margin value"), { target: { value: "1px" } });
        fireEvent.keyDown(screen.getByRole("button", { name: "Delete property margin" }), { key: "Escape" });

        expect(screen.queryByText("margin")).toBeNull();
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("does not save a typed value when Escape cancels a new property", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "margin");
        fireEvent.change(screen.getByLabelText("margin value"), { target: { value: "1px" } });
        fireEvent.keyDown(screen.getByLabelText("margin value"), { key: "Escape" });

        expect(screen.queryByText("margin")).toBeNull();
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("saves a new property when its value is committed", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "margin");
        commit("margin value", "1px");

        expect(updateValue).toHaveBeenCalledWith("margin", "1px");
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("does not save a typed draft when the new property is deleted", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "margin");
        fireEvent.change(screen.getByLabelText("margin value"), { target: { value: "1px" } });
        fireEvent.click(screen.getByRole("button", { name: "Delete property margin" }));

        expect(screen.queryByText("margin")).toBeNull();
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("keeps an edited property removed when Delete is clicked before the draft is committed", () => {
        const { updateValue, deleteKey } = renderFields(jest.fn(), jest.fn(), true);

        fireEvent.click(screen.getByText("var(--text-color)"));
        fireEvent.change(screen.getByLabelText("color value"), { target: { value: "navy" } });
        fireEvent.click(screen.getByRole("button", { name: "Delete property color" }));

        expect(deleteKey).toHaveBeenCalledTimes(1);
        expect(deleteKey).toHaveBeenCalledWith("color");
        expect(updateValue).not.toHaveBeenCalled();
    });

    test("does not stage a whitespace-only property name", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        fireEvent.change(screen.getByLabelText("New property name value"), { target: { value: "   " } });
        fireEvent.click(screen.getByText("var(--text-color)"));

        expect(document.querySelectorAll(".property-key")).toHaveLength(1);
        expect(document.querySelector(".property-key")?.textContent).toBe("color");
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("focuses an existing property instead of clearing it when the name is entered again", () => {
        const { updateValue, deleteKey } = renderFields();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "color");

        expect((screen.getByLabelText("color value") as HTMLInputElement).value).toBe("var(--text-color)");
        expect(updateValue).not.toHaveBeenCalled();
        expect(deleteKey).not.toHaveBeenCalled();
    });

    test("Enter commits a value and leaves edit mode without opening the next property", () => {
        const { updateValue } = renderRule();

        fireEvent.click(screen.getByText("navy"));
        const input = screen.getByLabelText("color value");
        fireEvent.change(input, { target: { value: "blue" } });
        // Focus moves to the value button during keydown; the browser must not
        // then turn the same Enter into a click that reopens the editor.
        const notCancelled = fireEvent.keyDown(input, { key: "Enter" });

        expect(notCancelled).toBe(false);
        expect(updateValue).toHaveBeenCalledWith("color", "blue");
        expect(screen.getByText("blue")).toBeTruthy();
        expect(screen.queryByLabelText("text-decoration value")).toBeNull();
        expect(document.querySelector(".property-value-editor")).toBeNull();
        expect(document.querySelector("input")).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit color: blue" }));
    });

    test("Enter on the last value does not open a new property name", () => {
        const { updateValue } = renderRule();

        fireEvent.click(screen.getByText("none"));
        commit("text-decoration value", "underline");

        expect(updateValue).toHaveBeenCalledWith("text-decoration", "underline");
        expect(screen.queryByLabelText("New property name value")).toBeNull();
        expect(document.querySelector("input")).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit text-decoration: underline" }));
    });

    test("Escape cancels a value in a rule with several declarations", () => {
        const { updateValue } = renderRule();

        fireEvent.click(screen.getByText("navy"));
        commit("color value", "blue", "Escape");

        expect(updateValue).not.toHaveBeenCalled();
        expect(screen.getByText("navy")).toBeTruthy();
        expect(document.querySelector("input")).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit color: navy" }));
    });

    test("clearing a value moves focus to the next declaration", () => {
        const { deleteKey } = renderRule();

        fireEvent.click(screen.getByText("navy"));
        commit("color value", "");

        expect(deleteKey).toHaveBeenCalledWith("color");
        expect(screen.queryByText("color")).toBeNull();
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit text-decoration: none" }));
    });

    test("a new property keeps focus when its first value is stored", () => {
        const { updateValue } = renderRule();

        fireEvent.click(screen.getByRole("table"));
        commit("New property name value", "margin");
        commit("margin value", "1px");

        expect(updateValue).toHaveBeenCalledWith("margin", "1px");
        expect(document.activeElement).toBe(screen.getByRole("button", { name: "Edit margin: 1px" }));
    });

    test("Escape on a focused declaration that is not being edited keeps focus there", () => {
        const { updateValue } = renderRule();

        fireEvent.click(screen.getByText("navy"));
        commit("color value", "blue");
        const value = screen.getByRole("button", { name: "Edit color: blue" });
        fireEvent.keyDown(value, { key: "Escape" });

        expect(document.activeElement).toBe(value);
        expect(document.querySelector("input")).toBeNull();
        expect(updateValue).toHaveBeenCalledTimes(1);
    });

    test("an empty value's accessible name includes its visible placeholder", () => {
        render(
            <MappedTextFields
                value={new Map([["margin", ""]])}
                updateValue={jest.fn()}
                deleteKey={jest.fn()}
                container={({ children, onClick }) => (
                    <table onClick={onClick}><tbody>{children}</tbody></table>
                )}
            />
        );

        const value = screen.getByRole("button", { name: "Edit margin: Enter a value" });
        expect(value.textContent).toBe("Enter a value");
    });
    test("Enter on a focused declaration opens its editor", () => {
        renderRule();

        fireEvent.click(screen.getByText("navy"));
        commit("color value", "blue");
        // A browser turns Enter on a focused button into a click.
        fireEvent.click(screen.getByRole("button", { name: "Edit color: blue" }));

        expect((screen.getByLabelText("color value") as HTMLInputElement).value).toBe("blue");
    });
});
