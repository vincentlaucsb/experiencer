/**
 * @jest-environment jsdom
 */
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";

import { SelectedNodeHighlightBox } from "@/editor/HighlightBox";
import registerNodes from "@/resume/schema";
import { useEditorStore } from "@/shared/stores/editorStore";
import { HintKey, hintStore } from "@/shared/stores/hintStore";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";

beforeAll(() => registerNodes());

beforeEach(() => {
    resumeNodeStore.setNodes([{
        type: "Section",
        uuid: "section-1",
        value: "Experience",
        childNodes: [{
            type: "Entry",
            uuid: "entry-1",
            title: ["Example Company"],
            subtitle: ["Engineer"],
            childNodes: []
        }]
    }]);
});

afterEach(() => {
    act(() => useEditorStore.getState().unselectNode());
    resumeNodeStore.setNodes([]);
    hintStore.reset();
});

test("keeps one node menu visible as selection and editing state change", async () => {
    render(
        <>
            <section data-uuid="section-1">Experience</section>
            <article data-uuid="entry-1">Example Company</article>
            <SelectedNodeHighlightBox />
        </>
    );

    act(() => useEditorStore.getState().selectNode("entry-1"));

    const entryMenu = await screen.findByRole("button", { name: "More options for Entry" });
    expect(entryMenu.getAttribute("aria-haspopup")).toBe("menu");
    expect(entryMenu.getAttribute("aria-expanded")).toBe("false");
    fireEvent.mouseLeave(screen.getByText("Example Company"));
    expect(entryMenu).toBeTruthy();
    expect(screen.getByRole("note").textContent).toContain("node menu");

    fireEvent.click(entryMenu);
    expect(entryMenu.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menuitem", { name: "Entry" })).toBeTruthy();
    expect(screen.getByRole("menuitem", { name: "Select Section: Experience" })).toBeTruthy();
    expect(hintStore.isDismissed(HintKey.NodeOptions)).toBe(true);

    act(() => useEditorStore.getState().editNode("entry-1"));
    expect(screen.getByRole("button", { name: "More options for Entry" })).toBeTruthy();

    act(() => useEditorStore.getState().selectNode("section-1"));
    await waitFor(() => {
        expect(screen.getByRole("button", { name: "More options for Section" })).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: "More options for Entry" })).toBeNull();
});
