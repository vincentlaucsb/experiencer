import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { TopNavBar } from "@/controls/TopNavBar";

const baseProps = {
    isEditing: true,
    mode: "normal" as const,
    exportHtml: jest.fn(),
    exportToPng: jest.fn(),
    loadData: jest.fn(),
    saveFile: jest.fn(),
    saveLocal: jest.fn(),
    print: jest.fn(),
    new: jest.fn(),
    toggleLanding: jest.fn(),
    toggleHelp: jest.fn()
};

test("renders optional top-menu extension items without knowing their feature", () => {
    const { rerender } = render(<TopNavBar {...baseProps} />);
    expect(screen.queryByRole("button", { name: "Extension action" })).toBeNull();

    rerender(
        <TopNavBar
            {...baseProps}
            extraItems={<button type="button">Extension action</button>}
        />
    );

    expect(screen.getByRole("button", { name: "Extension action" })).toBeTruthy();
});

test("shows document-scoped controls only while editing", () => {
    const { rerender } = render(
        <TopNavBar
            {...baseProps}
            isEditing={false}
            documentItems={<button type="button">Document action</button>}
            documents={[{
                id: "resume-1",
                title: "Canonical Resume",
                schemaVersion: 1,
                version: 2,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
        />
    );

    expect(screen.queryByRole("button", { name: "Document action" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Documents" })).toBeNull();

    rerender(
        <TopNavBar
            {...baseProps}
            documentItems={<button type="button">Document action</button>}
            documents={[{
                id: "resume-1",
                title: "Canonical Resume",
                schemaVersion: 1,
                version: 2,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
        />
    );

    expect(screen.getByRole("button", { name: "Document action" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Documents" })).toBeTruthy();
});

test("renders optional File-menu extension items", () => {
    render(
        <TopNavBar
            {...baseProps}
            fileMenuItems={<li><button type="button">Document extension</button></li>}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("button", { name: "Document extension" })).toBeTruthy();
});

test("shows injected document labels in the active-document control", () => {
    render(
        <TopNavBar
            {...baseProps}
            activeDocumentId="resume-1"
            documents={[{
                id: "resume-1",
                title: "Canonical Resume",
                schemaVersion: 1,
                version: 2,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
            documentLabels={{ "resume-1": "Template" }}
        />
    );

    expect(screen.getByRole("button", { name: "Canonical Resume · Template" })).toBeTruthy();
});

test("marks the active document label for visual truncation while preserving its full name", () => {
    const title = "A document title that is intentionally much longer than the header";
    render(
        <TopNavBar
            {...baseProps}
            activeDocumentId="resume-1"
            documents={[{
                id: "resume-1",
                title,
                schemaVersion: 1,
                version: 2,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
            documentLabels={{ "resume-1": "Cloud" }}
        />
    );

    const fullLabel = `${title} · Cloud`;
    const selector = screen.getByRole("button", { name: fullLabel });
    expect(selector.classList.contains("document-selector-trigger")).toBe(true);
    expect(selector.getAttribute("title")).toBe(fullLabel);
    expect(
        selector.querySelector(".document-selector-label")?.textContent
    ).toBe(fullLabel);
});

test("renames the active document from the top of the document selector", async () => {
    const renameDocument = jest.fn(async () => null);
    render(
        <TopNavBar
            {...baseProps}
            activeDocumentId="resume-1"
            documents={[{
                id: "resume-1",
                title: "Canonical Resume",
                schemaVersion: 1,
                version: 2,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
            renameDocument={renameDocument}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "Canonical Resume" }));
    const form = screen.getByRole("form", { name: "Rename current resume" });
    const input = within(form).getByRole("textbox", { name: "Resume name" });

    expect(input.getAttribute("autocomplete")).toBe("off");
    fireEvent.change(input, { target: { value: "My Awesome Resume" } });
    fireEvent.click(within(form).getByRole("button", { name: "Save" }));

    await waitFor(() => {
        expect(renameDocument).toHaveBeenCalledWith(
            "resume-1",
            "My Awesome Resume"
        );
    });
});
