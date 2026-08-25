/**
 * @jest-environment jsdom
 */
import { act, render, waitFor } from "@testing-library/react";

import TopEditingBarAdapter from "../TopEditingBarAdapter";
import Section from "@/resume/Section";
import registerNodes from "@/resume/schema";
import { useEditorStore } from "@/shared/stores/editorStore";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { assignIds } from "@/shared/utils/assignIds";

registerNodes();

function toolbarSections(container: HTMLElement): string[] {
    return Array.from(
        container.querySelectorAll<HTMLElement>("[data-toolbar-section]")
    ).map((section) => section.dataset.toolbarSection ?? "");
}

afterEach(() => {
    act(() => {
        useEditorStore.getState().unselectNode();
        resumeNodeStore.setNodes([]);
        resumeNodeStore.clearUnsavedChanges();
    });
});

test("switches between root and selected-node projections without remounting", async () => {
    const section = assignIds({ type: Section.type });
    act(() => {
        resumeNodeStore.setNodes([section]);
    });

    const { container } = render(<TopEditingBarAdapter />);
    const toolbar = container.querySelector("#toolbar");
    expect(toolbar).toBeTruthy();
    expect(toolbarSections(container)).toEqual([
        "Editing",
        "Page Setup",
        "Clipboard",
        "Resume"
    ]);

    act(() => {
        useEditorStore.getState().selectNode(section.uuid);
    });

    await waitFor(() => {
        expect(toolbarSections(container)).toEqual([
            "Editing",
            "Current Node (Section)",
            "Move",
            "CSS"
        ]);
    });
    expect(container.querySelector("#toolbar")).toBe(toolbar);

    act(() => {
        useEditorStore.getState().unselectNode();
    });

    await waitFor(() => {
        expect(toolbarSections(container)).toEqual([
            "Editing",
            "Page Setup",
            "Clipboard",
            "Resume"
        ]);
    });
    expect(container.querySelector("#toolbar")).toBe(toolbar);
});
