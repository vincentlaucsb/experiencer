import { act, fireEvent, render, screen, within } from "@testing-library/react";

import SaveAsDialog from "@/controls/SaveAsDialog";
import { SaveAsDialogStore } from "@/shared/stores/saveAsDialogStore";

test("renders from store state and delegates the chosen filename", () => {
    const store = new SaveAsDialogStore();
    const saveFile = jest.fn();
    render(<SaveAsDialog isEditing saveFile={saveFile} store={store} />);

    act(() => store.open());

    const dialog = screen.getByRole("dialog", { name: "Save File" });
    const filename = within(dialog).getByRole("textbox", { name: "Filename" });
    fireEvent.change(filename, { target: { value: "portfolio.json" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Download" }));

    expect(saveFile).toHaveBeenCalledWith("portfolio.json");
});

test("closes and disables itself when editing ends", () => {
    const store = new SaveAsDialogStore();
    const { rerender } = render(<SaveAsDialog isEditing store={store} />);
    act(() => store.open());
    expect(screen.getByRole("dialog", { name: "Save File" })).toBeTruthy();

    rerender(<SaveAsDialog isEditing={false} store={store} />);

    expect(store.getSnapshot().isOpen).toBe(false);
    expect(screen.queryByRole("dialog", { name: "Save File" })).toBeNull();
    act(() => store.open());
    expect(store.getSnapshot().isOpen).toBe(false);
});
