import { fireEvent, render, screen, within } from "@testing-library/react";
import Landing from "../Landing";

beforeEach(() => localStorage.clear());

test("renders grouped documents and invokes origin-specific secondary actions", () => {
    const copy = jest.fn();
    render(
        <Landing
            activeDocumentId="local:1"
            deleteDocument={jest.fn()}
            documentActions={{
                "local:1": [{
                    id: "copy",
                    label: "Copy to cloud",
                    run: copy
                }]
            }}
            documentGroups={[
                { id: "cloud", title: "Cloud resumes", documentIds: ["cloud:1"] },
                { id: "local", title: "On this device", documentIds: ["local:1"] }
            ]}
            documents={[
                {
                    id: "cloud:1",
                    title: "Cloud Resume",
                    schemaVersion: 1,
                    version: 1,
                    updatedAt: "2026-07-28T00:00:00Z"
                },
                {
                    id: "local:1",
                    title: "Local Resume",
                    schemaVersion: 1,
                    version: 2,
                    updatedAt: "2026-07-28T00:00:00Z"
                }
            ]}
            loadData={jest.fn()}
            loadLocal={jest.fn()}
            new={jest.fn()}
            openDocument={jest.fn()}
            renameDocument={jest.fn()}
        />
    );

    expect(screen.getByRole("heading", { name: "Cloud resumes" })).toBeTruthy();
    const localGroup = screen.getByRole("heading", { name: "On this device" })
        .closest<HTMLElement>(".resume-library-group")!;
    expect(within(localGroup).getByText("Local Resume")).toBeTruthy();
    expect(
        within(localGroup).getByRole("button", { name: "Delete" })
            .classList.contains("pure-button-outline")
    ).toBe(true);

    fireEvent.click(within(localGroup).getByRole("button", { name: "Copy to cloud" }));
    expect(copy).toHaveBeenCalledTimes(1);
});

test("keeps rename open and shows the action message when saving fails", async () => {
    const rename = jest.fn(async () => "Name must be 200 characters or fewer.");
    render(
        <Landing
            documents={[{
                id: "resume-1",
                title: "Original",
                schemaVersion: 1,
                version: 1,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
            loadData={jest.fn()}
            loadLocal={jest.fn()}
            new={jest.fn()}
            renameDocument={rename}
        />
    );

    fireEvent.click(screen.getByRole("button", { name: "Rename" }));
    const name = screen.getByRole("textbox", { name: "Name" });
    expect(name.getAttribute("maxlength")).toBe("200");
    fireEvent.change(name, { target: { value: "Rejected name" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect((await screen.findByRole("alert")).textContent)
        .toBe("Name must be 200 characters or fewer.");
    expect(screen.getByRole("textbox", { name: "Name" })).toBeTruthy();
    expect(rename).toHaveBeenCalledWith("resume-1", "Rejected name");
});

test("shows understated metadata for an empty document group", () => {
    render(
        <Landing
            documentGroups={[{
                id: "cloud",
                title: "Cloud resumes",
                summary: "0 / 100",
                showWhenEmpty: true,
                documentIds: []
            }]}
            documents={[]}
            loadData={jest.fn()}
            loadLocal={jest.fn()}
            new={jest.fn()}
        />
    );

    const heading = screen.getByRole("heading", { name: "Cloud resumes" });
    expect(heading).toBeTruthy();
    expect(within(heading.parentElement!).getByText("0 / 100")).toBeTruthy();
});

test("marks long resume titles for visual truncation while preserving the full name", () => {
    const title = "A resume title that is intentionally much longer than the available row";
    render(
        <Landing
            documentLabels={{ "resume-1": "Cloud" }}
            documents={[{
                id: "resume-1",
                title,
                schemaVersion: 1,
                version: 1,
                updatedAt: "2026-07-28T00:00:00Z"
            }]}
            loadData={jest.fn()}
            loadLocal={jest.fn()}
            new={jest.fn()}
        />
    );

    const titleText = screen.getByText(title);
    expect(titleText.classList.contains("resume-library-title-text")).toBe(true);
    expect(titleText.getAttribute("title")).toBe(title);
    expect(screen.getByText("Cloud")).toBeTruthy();
});
