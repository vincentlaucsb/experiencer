import { fireEvent, render, screen } from "@testing-library/react";

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
