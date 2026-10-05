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
});
