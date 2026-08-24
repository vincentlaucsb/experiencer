/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen, within } from "@testing-library/react";

import CssEditor from "@/editor/CssEditor";
import CssNode, { ReadonlyCssNode } from "@/shared/CssTree";
import type { CssEditorCommands } from "@/shared/stores/cssEditorCommands";

function createCommands(): jest.Mocked<CssEditorCommands> {
    return {
        addSelector: jest.fn(),
        updateName: jest.fn(),
        updateProperty: jest.fn(),
        updateDescription: jest.fn(),
        updateSelector: jest.fn(),
        replaceProperties: jest.fn(),
        deleteKey: jest.fn(),
        deleteNode: jest.fn()
    };
}

function createLiveSync() {
    return { importSection: jest.fn() };
}

describe("CssEditor views", () => {
    afterEach(() => document.getElementById("hl-box-container")?.remove());

    test("keeps recursive rules collapsed until their own heading expands", async () => {
        const root = new CssNode("Resume CSS", { color: "black" }, "body");
        root.addNode("Entry", { display: "grid" }, ".entry");

        render(
            <CssEditor
                commands={createCommands()}
                cssNode={new ReadonlyCssNode(root)}
                isOpen
                liveSync={createLiveSync()}
                liveTree="resume"
            />
        );
        await screen.findAllByLabelText("Import live changes");

        expect(screen.getByText("color")).toBeTruthy();
        expect(screen.queryByText("display")).toBeNull();

        fireEvent.click(screen.getByText("Entry"));

        expect(screen.getByText("display")).toBeTruthy();
    });

    test("orders and deduplicates parent rules, reveals three initially, and never recurses", async () => {
        const root = new CssNode("Root", {}, "body");
        const levelOne = root.addNode("Level 1", {}, ".one");
        const levelTwo = levelOne.addNode("Level 2", {}, ".two");
        const levelThree = levelTwo.addNode("Level 3", { padding: "1rem" }, ".three");
        const selected = levelThree.addNode("Selected", {}, ".selected");
        const externalRoot = new CssNode("External Root", {}, ".external-root");
        const external = externalRoot.addNode("External", {}, ".external");
        const readonlySelected = new ReadonlyCssNode(selected);
        const duplicateLevelTwo = readonlySelected.ancestors[1];
        const { container } = render(
            <CssEditor
                additionalAncestors={[duplicateLevelTwo, new ReadonlyCssNode(external)]}
                commands={createCommands()}
                cssNode={readonlySelected}
                isOpen
                liveSync={createLiveSync()}
                liveTree="resume"
                showAncestors
            />
        );
        await screen.findAllByLabelText("Import live changes");

        expect(screen.getAllByText("PARENT")).toHaveLength(3);
        expect(screen.getByText("Level 3")).toBeTruthy();
        expect(screen.getByText("Level 2")).toBeTruthy();
        expect(screen.getByText("Level 1")).toBeTruthy();
        expect(screen.queryByText("Root")).toBeNull();
        expect(container.querySelectorAll("section.css-category")).toHaveLength(4);

        fireEvent.click(screen.getByText("Level 3"));
        expect(screen.getByText("padding")).toBeTruthy();
        expect(screen.getAllByText("Selected")).toHaveLength(1);

        fireEvent.click(screen.getByText("Show 2 more parents"));

        expect(screen.getAllByText("PARENT")).toHaveLength(5);
        expect(screen.getByText("Root")).toBeTruthy();
        expect(screen.getByText("External")).toBeTruthy();
        expect(screen.getAllByText("Level 2")).toHaveLength(1);
        expect(container.querySelectorAll("section.css-category")).toHaveLength(6);
    });

    test("routes toolbar import, pseudo-rule, add-rule, and delete commands", async () => {
        const root = new CssNode("Resume CSS", {}, "body");
        root.addNode("Entry", {}, ".entry");
        const commands = createCommands();
        const liveSync = createLiveSync();
        render(
            <CssEditor
                commands={commands}
                cssNode={new ReadonlyCssNode(root)}
                isOpen
                liveSync={liveSync}
                liveTree="resume"
            />
        );

        const rootHeading = screen.getByText("Resume CSS").closest("h2") as HTMLElement;
        fireEvent.click(await within(rootHeading).findByLabelText("Import live changes"));
        expect(liveSync.importSection).toHaveBeenCalledWith(
            "resume",
            expect.objectContaining({ name: "Resume CSS" }),
            commands
        );

        fireEvent.click(within(rootHeading).getByText("::"));
        fireEvent.click(await screen.findByText("::before"));
        expect(commands.addSelector).toHaveBeenCalledWith([], "::before", "::before");

        const addButton = rootHeading.querySelector(".icofont-ui-add")?.closest("button");
        expect(addButton).toBeTruthy();
        fireEvent.click(addButton!);
        expect(commands.addSelector).toHaveBeenCalledWith(
            [],
            "Resume CSS Ruleset #1",
            "#some-id.some-class"
        );

        const childHeading = screen.getByText("Entry").closest("h2") as HTMLElement;
        const deleteButton = childHeading.querySelector(".icofont-ui-delete")?.closest("button");
        expect(deleteButton).toBeTruthy();
        fireEvent.click(deleteButton!);
        const confirmButton = childHeading.querySelector(".icofont-ui-check")?.closest("button");
        expect(confirmButton).toBeTruthy();
        fireEvent.click(confirmButton!);
        expect(commands.deleteNode).toHaveBeenCalledWith(["Entry"]);
    });

    test("characterizes generic value suggestions without silently adding CSS-wide values", async () => {
        const root = new CssNode("Resume CSS", { color: "black" }, "body");
        render(
            <CssEditor
                commands={createCommands()}
                cssNode={new ReadonlyCssNode(root)}
                isOpen
                liveSync={createLiveSync()}
                liveTree="resume"
                varSuggestions={["var(--accent)"]}
            />
        );
        await screen.findAllByLabelText("Import live changes");

        fireEvent.click(screen.getByText("black"));
        const valueInput = screen.getByLabelText("color value");
        const datalist = document.getElementById(valueInput.getAttribute("list") || "");
        const values = Array.from(datalist?.querySelectorAll("option") || [])
            .map((option) => option.getAttribute("value"));

        expect(values).toContain("var(--accent)");
        expect(values).not.toContain("initial");
        expect(values).not.toContain("inherit");
        expect(values).not.toContain("unset");
    });

    test("resets open and highlight presentation when the keyed path changes", async () => {
        const first = new CssNode("First", { color: "black" }, ".first");
        const second = new CssNode("Second", { display: "grid" }, ".second");
        const commands = createCommands();
        const liveSync = createLiveSync();
        const { container, rerender } = render(
            <CssEditor
                key="first-path"
                commands={commands}
                cssNode={new ReadonlyCssNode(first)}
                isOpen
                liveSync={liveSync}
                liveTree="resume"
            />
        );
        await screen.findAllByLabelText("Import live changes");

        const highlightButton = container.querySelector("button.hl") as HTMLButtonElement;
        fireEvent.click(highlightButton);
        expect(highlightButton.classList.contains("hl-active")).toBe(true);
        expect(screen.getByText("color")).toBeTruthy();

        rerender(
            <CssEditor
                key="second-path"
                commands={commands}
                cssNode={new ReadonlyCssNode(second)}
                liveSync={liveSync}
                liveTree="resume"
            />
        );
        await screen.findAllByLabelText("Import live changes");

        expect(container.querySelector("button.hl")?.classList.contains("hl-active")).toBe(false);
        expect(screen.queryByText("display")).toBeNull();
    });
});
