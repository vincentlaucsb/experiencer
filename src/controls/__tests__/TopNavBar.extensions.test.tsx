import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

import { TopNavBar } from "@/controls/TopNavBar";
import { PureMenuItem } from "@/controls/menus/PureMenu";

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
    toggleLanding: jest.fn()
};

test("keeps Help visible while hiding document menus on the landing page", () => {
    render(<TopNavBar {...baseProps} isEditing={false} />);

    expect(screen.queryByRole("button", { name: "File" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Theme" })).toBeNull();
    expect(screen.getByRole("button", { name: "Help" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    expect(screen.getByRole("menuitem", { name: /Documentation/ })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Keyboard shortcuts" })).toBeTruthy();
    expect(screen.queryByRole("separator")).toBeNull();
    expect(screen.queryByText(/feedback/i)).toBeNull();
});

test("appends focused Help extensions after a separator", () => {
    const openFeedback = jest.fn();
    render(
        <TopNavBar
            {...baseProps}
            helpMenuItems={[{
                id: "feedback",
                label: "Send feedback",
                onSelect: openFeedback
            }]}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    const items = screen.getAllByRole("menuitem");
    expect(items.at(-1)?.textContent).toContain("Send feedback");
    expect(screen.getByRole("separator")).toBeTruthy();
    fireEvent.click(screen.getByRole("menuitem", { name: "Send feedback" }));
    expect(openFeedback).toHaveBeenCalledTimes(1);
});

test("opens documentation safely in a new tab", () => {
    const openedWindow = { opener: {} } as Window;
    const open = jest.spyOn(window, "open").mockReturnValue(openedWindow);
    render(<TopNavBar {...baseProps} />);

    fireEvent.click(screen.getByRole("button", { name: "Help" }));
    fireEvent.click(screen.getByRole("menuitem", { name: /Documentation/ }));

    expect(open).toHaveBeenCalledWith("/docs/", "_blank", "noopener,noreferrer");
    expect(openedWindow.opener).toBeNull();
});

test("opens and closes the semantic keyboard-shortcuts modal", async () => {
    render(<TopNavBar {...baseProps} />);
    const help = screen.getByRole("button", { name: "Help" });

    fireEvent.click(help);
    fireEvent.click(screen.getByRole("menuitem", { name: "Keyboard shortcuts" }));

    const dialog = screen.getByRole("dialog", { name: "Keyboard shortcuts" });
    expect(within(dialog).getAllByText("Ctrl").length).toBeGreaterThan(0);
    expect(dialog.querySelectorAll("kbd").length).toBeGreaterThan(0);
    fireEvent.click(within(dialog).getByRole("button", { name: "Close Keyboard shortcuts" }));

    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Keyboard shortcuts" })).toBeNull());
    await waitFor(() => expect(document.activeElement).toBe(help));
});

test("renders optional account-area items next to authentication controls", () => {
    render(
        <TopNavBar
            {...baseProps}
            isEditing={false}
            secondaryItems={<a href="/pricing">Pricing</a>}
            signIn={jest.fn()}
        />
    );

    const pricing = screen.getByRole("link", { name: "Pricing" });
    const signIn = screen.getByRole("button", { name: "Log in" });
    expect(pricing.getAttribute("href")).toBe("/pricing");
    expect(pricing.compareDocumentPosition(signIn) & Node.DOCUMENT_POSITION_FOLLOWING)
        .toBeTruthy();
});

test("shows the storage mode beside the account label", () => {
    const { rerender, container } = render(
        <TopNavBar
            {...baseProps}
            accountLabel="Local editing"
            editingStorage="local"
        />
    );

    expect(screen.getByTitle("Local editing")).toBeTruthy();
    expect(container.querySelector(".account-mode-icon--local")).toBeTruthy();

    rerender(
        <TopNavBar
            {...baseProps}
            accountLabel="casey@example.com"
            editingStorage="cloud"
        />
    );

    expect(container.querySelector(".account-mode-icon--cloud")).toBeTruthy();
    expect(container.querySelector(".account-mode-icon--local")).toBeNull();
});

test("settles a responsive density change without an expansion feedback loop", async () => {
    const { container } = render(<TopNavBar {...baseProps} />);
    const brand = container.querySelector<HTMLElement>("#brand");
    if (!brand) throw new Error("Expected the top navigation brand");

    Object.defineProperty(brand, "clientWidth", {
        configurable: true,
        value: 400
    });
    Object.defineProperty(brand, "scrollWidth", {
        configurable: true,
        get: () => brand.dataset.navDensity === "0" ? 1000 : 300
    });

    window.dispatchEvent(new Event("resize"));
    await waitFor(() => expect(brand.dataset.navDensity).toBe("1"));
    expect(brand.dataset.navDensity).toBe("1");
});

test("does not render the repository link in the editor header", () => {
    render(<TopNavBar {...baseProps} />);

    expect(screen.queryByRole("link", { name: "View Experiencer on GitHub" })).toBeNull();
});

test("shows document-scoped controls only while editing", () => {
    const { rerender } = render(
        <TopNavBar
            {...baseProps}
            isEditing={false}
            documentItems={(
                <PureMenuItem className="top-nav-document-extension">
                    <button type="button">Document action</button>
                </PureMenuItem>
            )}
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
            documentItems={(
                <PureMenuItem className="top-nav-document-extension">
                    <button type="button">Document action</button>
                </PureMenuItem>
            )}
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
            fileMenuItems={[{ id: "document-extension", label: "Document extension" }]}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "File" }));
    expect(screen.getByRole("menuitem", { name: "Document extension" })).toBeTruthy();
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
    fireEvent.click(screen.getByRole("menuitem", { name: "Rename…" }));
    expect(screen.getByRole("dialog", { name: "Rename resume" }).classList)
        .toContain("rename-resume-modal");
    const form = screen.getByRole("form", { name: "Rename current resume" });
    const input = within(form).getByRole("textbox", { name: "Resume name" });

    expect(input.classList).toContain("rename-resume-input");
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
