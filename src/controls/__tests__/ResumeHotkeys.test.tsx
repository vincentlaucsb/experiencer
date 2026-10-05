import {
    ResumeHotKeyMap,
    ResumeHotKeys,
    type ResumeHotKeysProps
} from "@/controls/ResumeHotkeys";
import { saveAsDialogStore } from "@/shared/stores/saveAsDialogStore";
import { localKeyboardScopeAttributes } from "@/shared/ui/localKeyboardScope";
import MappedTextFields from "@/controls/inputs/MappedTextFields";
import { fireEvent, render, screen } from "@testing-library/react";

const props: ResumeHotKeysProps = {
    copyClipboard: jest.fn(),
    cutClipboard: jest.fn(),
    delete: jest.fn(),
    reset: jest.fn()
};

afterEach(() => saveAsDialogStore.reset());

test("maps Ctrl + Shift + S to the shared Save As command", () => {
    saveAsDialogStore.setAvailable(true);
    const preventDefault = jest.fn();
    const hotkeys = new ResumeHotKeys(props);

    hotkeys.getHandlers().SAVE_AS({ preventDefault });

    expect(ResumeHotKeyMap.SAVE_AS).toEqual(expect.objectContaining({
        sequence: "ctrl+shift+s"
    }));
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(saveAsDialogStore.getSnapshot().isOpen).toBe(true);
});

describe("keys from a control that owns its keyboard input", () => {
    function nodeActions() {
        return {
            copyClipboard: jest.fn(),
            cutClipboard: jest.fn(),
            pasteClipboard: jest.fn(),
            delete: jest.fn(),
            reset: jest.fn(),
            save: jest.fn(),
            undo: jest.fn(),
            redo: jest.fn()
        };
    }

    function eventFrom(target: Element) {
        return { target, preventDefault: jest.fn() } as unknown as KeyboardEvent;
    }

    test("do not run selected-node actions, but save and undo/redo still apply", () => {
        const scope = document.createElement("tr");
        Object.entries(localKeyboardScopeAttributes).forEach(([name, value]) => scope.setAttribute(name, value));
        const button = scope.appendChild(document.createElement("button"));
        const actions = nodeActions();
        const handlers = new ResumeHotKeys(actions).getHandlers();

        for (const name of ["COPY_SELECTED", "CUT_SELECTED", "PASTE_SELECTED", "DELETE_SELECTED", "ESCAPE"] as const) {
            handlers[name](eventFrom(button));
        }
        handlers.SAVE(eventFrom(button));
        handlers.UNDO(eventFrom(button));
        handlers.REDO(eventFrom(button));

        expect(actions.copyClipboard).not.toHaveBeenCalled();
        expect(actions.cutClipboard).not.toHaveBeenCalled();
        expect(actions.pasteClipboard).not.toHaveBeenCalled();
        expect(actions.delete).not.toHaveBeenCalled();
        expect(actions.reset).not.toHaveBeenCalled();
        expect(actions.save).toHaveBeenCalledTimes(1);
        expect(actions.undo).toHaveBeenCalledTimes(1);
        expect(actions.redo).toHaveBeenCalledTimes(1);
    });

    test("keep selected-node actions everywhere else", () => {
        const actions = nodeActions();
        const handlers = new ResumeHotKeys(actions).getHandlers();
        const outside = document.createElement("button");

        handlers.CUT_SELECTED(eventFrom(outside));
        handlers.PASTE_SELECTED(eventFrom(outside));
        handlers.DELETE_SELECTED(eventFrom(outside));
        handlers.ESCAPE(eventFrom(outside));

        expect(actions.cutClipboard).toHaveBeenCalledTimes(1);
        expect(actions.pasteClipboard).toHaveBeenCalledTimes(1);
        expect(actions.delete).toHaveBeenCalledTimes(1);
        expect(actions.reset).toHaveBeenCalledTimes(1);
    });

    test("a focused CSS declaration value does not cut, paste, delete, or deselect the selected node", () => {
        const actions = nodeActions();
        render(
            <>
                <ResumeHotKeys {...actions} />
                <MappedTextFields
                    value={new Map([["color", "navy"]])}
                    updateValue={jest.fn()}
                    deleteKey={jest.fn()}
                    container={({ children, onClick }) => (
                        <table onClick={onClick}><tbody>{children}</tbody></table>
                    )}
                />
                <button type="button">Outside</button>
            </>
        );
        const value = screen.getByRole("button", { name: "Edit color: navy" });

        for (const init of [
            { key: "x", code: "KeyX", ctrlKey: true },
            { key: "x", code: "KeyX", metaKey: true },
            { key: "v", code: "KeyV", ctrlKey: true },
            { key: "v", code: "KeyV", metaKey: true },
            { key: "Delete", code: "Delete" },
            { key: "Escape", code: "Escape" }
        ]) {
            fireEvent.keyDown(value, init);
            fireEvent.keyUp(value, init);
        }

        expect(actions.cutClipboard).not.toHaveBeenCalled();
        expect(actions.pasteClipboard).not.toHaveBeenCalled();
        expect(actions.delete).not.toHaveBeenCalled();
        expect(actions.reset).not.toHaveBeenCalled();

        // The same keys outside the CSS editor still reach the global shortcuts.
        const outside = screen.getByRole("button", { name: "Outside" });
        fireEvent.keyDown(outside, { key: "Delete", code: "Delete" });
        fireEvent.keyUp(outside, { key: "Delete", code: "Delete" });
        expect(actions.delete).toHaveBeenCalledTimes(1);
    });
});
