import { fireEvent, render, screen, within } from "@testing-library/react";

import PngExportModal from "@/controls/PngExportModal";

const readyProps = {
    isOpen: true,
    phase: "ready" as const,
    imageUrl: "blob:resume-preview",
    copyPhase: "idle" as const,
    onClose: jest.fn(),
    onCopy: jest.fn(),
    onDownload: jest.fn()
};

afterEach(() => {
    jest.clearAllMocks();
});

test("can cancel while the screenshot is being generated", () => {
    render(
        <PngExportModal
            {...readyProps}
            phase="loading"
        />
    );

    expect(screen.getByText(/primarily for quick visual review, including AI-assisted review/i)).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("Generating PNG");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(readyProps.onClose).toHaveBeenCalledTimes(1);
});

test("wires screenshot actions to the host callbacks", () => {
    render(<PngExportModal {...readyProps} />);

    const dialog = screen.getByRole("dialog", { name: "Resume screenshot" });
    expect(within(dialog).getByText(/Use PDF for final presentation or printing/i)).toBeTruthy();
    expect(within(dialog).getByRole("img", { name: "Resume screenshot preview" })
        .getAttribute("src")).toBe("blob:resume-preview");

    fireEvent.click(within(dialog).getByRole("button", { name: "Copy to Clipboard" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Download" }));
    fireEvent.click(within(dialog).getByRole("button", { name: "Close" }));

    expect(readyProps.onCopy).toHaveBeenCalledTimes(1);
    expect(readyProps.onDownload).toHaveBeenCalledTimes(1);
    expect(readyProps.onClose).toHaveBeenCalledTimes(1);
});
