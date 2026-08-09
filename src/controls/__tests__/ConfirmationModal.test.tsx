import { fireEvent, render, screen, within } from "@testing-library/react";

import ConfirmationModal from "@/controls/ConfirmationModal";

test("renders an accessible confirmation dialog and exposes both outcomes", () => {
    const onCancel = jest.fn();
    const onConfirm = jest.fn();

    render(
        <ConfirmationModal
            isOpen
            title="Delete resume"
            confirmLabel="Delete"
            onCancel={onCancel}
            onConfirm={onConfirm}
        >
            <p>Delete the selected resume?</p>
        </ConfirmationModal>
    );

    const dialog = screen.getByRole("dialog", { name: "Delete resume" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(document.getElementById(dialog.getAttribute("aria-labelledby") || "")?.textContent)
        .toContain("Delete resume");
    fireEvent.click(within(dialog).getByRole("button", { name: "Cancel" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Delete" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
});
