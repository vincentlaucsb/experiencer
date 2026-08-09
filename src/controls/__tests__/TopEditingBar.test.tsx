/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";

import TopEditingBarWrapper, { TopEditingBar, EditingBarProps } from "@/controls/TopEditingBar";
import MarkdownText from "@/resume/Markdown";
import Section from "@/resume/Section";
import { DescriptionListItemType, DescriptionListType } from "@/resume/List";
import registerNodes from "@/resume/schema";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { useEditorStore } from "@/shared/stores/editorStore";
import { assignIds } from "@/shared/utils/assignIds";
import { BasicResumeNode, NodeProperty, ResumeNode } from "@/types";
import type { ToolbarData } from "@/controls/toolbar/ToolbarMaker";

registerNodes();

function createProps(): EditingBarProps {
    return {
        addHtmlId: jest.fn(),
        addCssClasses: jest.fn(),
        addChild: jest.fn(),
        updateSelected: jest.fn((_key: string, _data: NodeProperty) => undefined),
        unselect: jest.fn(),
        copyClipboard: jest.fn(),
        cutClipboard: jest.fn(),
        delete: jest.fn(),
        moveUp: jest.fn(),
        moveDown: jest.fn(),
        duplicateBefore: jest.fn(),
        duplicateAfter: jest.fn(),
        pasteClipboard: jest.fn(),
        saveLocal: jest.fn(),
        undo: jest.fn(),
        redo: jest.fn(),
    };
}

afterEach(() => {
    act(() => {
        useEditorStore.getState().unselectNode();
        resumeNodeStore.setNodes([]);
    });
});

describe("TopEditingBar Insert visibility", () => {
    test("uses provided save handler for repository-backed saves", () => {
        const save = jest.fn();

        render(<TopEditingBarWrapper saveLocal={save} />);

        screen.getByLabelText("Save").click();

        expect(save).toHaveBeenCalledTimes(1);
    });

    test("hides Insert for selected Markdown node (no children)", async () => {
        const nodes = assignIds([
            {
                type: Section.type,
                childNodes: [
                    {
                        type: MarkdownText.type,
                        value: "Hello"
                    }
                ]
            }
        ] as BasicResumeNode[]);

        const markdownUuid = nodes[0].childNodes?.[0]?.uuid;
        if (!markdownUuid) {
            throw new Error("Expected markdown node UUID");
        }

        act(() => {
            resumeNodeStore.setNodes(nodes);
            useEditorStore.getState().selectNode(markdownUuid);
        });

        render(<TopEditingBar {...createProps()} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.queryByText("Insert")).toBeNull();
        expect(screen.getByLabelText("Delete")).toBeTruthy();
    });

    test("labels Description List insertion as Add Term", async () => {
        const nodes = assignIds([
            {
                type: DescriptionListType,
                childNodes: [{
                    type: DescriptionListItemType,
                    value: "Operations",
                    definitions: ["Planning systems"]
                }]
            }
        ] as BasicResumeNode[]);

        act(() => {
            resumeNodeStore.setNodes(nodes);
            useEditorStore.getState().selectNode(nodes[0].uuid);
        });

        render(<TopEditingBar {...createProps()} />);

        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            screen.getByRole("button", { name: "Insert" }).click();
        });

        expect(screen.getByRole("menuitem", { name: "Add Term" })).toBeTruthy();
    });

    test("labels an Entry insert with the selected section name", async () => {
        const nodes = assignIds([
            {
                type: Section.type,
                value: "Experience",
                childNodes: [
                    {
                        type: MarkdownText.type,
                        value: "Hello"
                    }
                ]
            }
        ] as BasicResumeNode[]);

        const sectionUuid = nodes[0].uuid;

        act(() => {
            resumeNodeStore.setNodes(nodes);
            useEditorStore.getState().selectNode(sectionUuid);
        });

        render(<TopEditingBar {...createProps()} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByText("Insert")).toBeTruthy();

        const insertButton = screen.getByRole("button", { name: "Insert" });
        expect(insertButton.querySelector(".toolbar-dropdown-indicator")).toBeTruthy();
        expect(insertButton.getAttribute("aria-haspopup")).toBe("menu");

        act(() => {
            insertButton.click();
        });

        const entryOption = screen.getByText("Experience Entry");
        const sectionOption = screen.getByText("Section");
        expect(entryOption).toBeTruthy();
        expect(entryOption.compareDocumentPosition(sectionOption) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(screen.getByRole("menuitem", { name: "Experience Entry" })).toBeTruthy();
        expect(screen.getByText("Text")).toBeTruthy();
        expect(screen.queryByText("Markdown")).toBeNull();
        expect(screen.queryByText("Entry")).toBeNull();
    });

    test("appends product-owned toolbar sections", () => {
        const additionalToolbarSections: ToolbarData = new Map([
            ["AI Review", {
                icon: "robot",
                iconTone: "brand",
                items: [{
                    icon: "robot",
                    iconTone: "brand",
                    text: "Review with AI",
                    onClick: jest.fn()
                }]
            }]
        ]);

        render(<TopEditingBar {...createProps()} additionalToolbarSections={additionalToolbarSections} />);

        expect(screen.getByText("AI Review")).toBeTruthy();
        const reviewButton = screen.getByRole("button", { name: "Review with AI" });
        expect(reviewButton).toBeTruthy();
        expect(reviewButton.querySelector(".toolbar-icon-brand")).toBeTruthy();
    });

    test("progressively collapses AI Review before core editing controls", async () => {
        const additionalToolbarSections: ToolbarData = new Map([
            ["AI Review", {
                icon: "robot",
                iconTone: "brand",
                collapsePriority: 0,
                items: [{
                    icon: "robot",
                    iconTone: "brand",
                    text: "Review with AI",
                    onClick: jest.fn()
                }]
            }]
        ]);

        render(
            <TopEditingBar
                {...createProps()}
                additionalToolbarSections={additionalToolbarSections}
            />
        );

        const toolbar = document.getElementById("toolbar");
        if (!toolbar) {
            throw new Error("Expected toolbar element");
        }
        const aiSection = toolbar.querySelector('[data-toolbar-section="AI Review"]');
        if (!aiSection) {
            throw new Error("Expected AI Review toolbar section");
        }
        Object.defineProperty(aiSection, "offsetWidth", {
            configurable: true,
            get: () => aiSection.classList.contains("toolbar-section-collapsed") ? 100 : 200
        });
        Object.defineProperty(toolbar, "clientWidth", {
            configurable: true,
            value: 500
        });
        Object.defineProperty(toolbar, "scrollWidth", {
            configurable: true,
            get: () => toolbar.querySelector(
                '[data-toolbar-section="AI Review"]'
            )?.classList.contains("toolbar-section-collapsed") ? 400 : 1000
        });

        act(() => {
            window.dispatchEvent(new Event("resize"));
        });
        await act(async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 150));
        });

        expect(screen.getByRole("button", { name: "AI Review" })).toBeTruthy();
        expect(screen.getByLabelText("Save")).toBeTruthy();
        expect(toolbar.querySelector('[data-toolbar-section="AI Review"]')
            ?.classList.contains("toolbar-section-collapsed")).toBe(true);
        expect(toolbar.querySelector('[data-toolbar-section="AI Review"] .toolbar-label')).toBeNull();
        expect(toolbar.querySelector('[data-toolbar-section="Editing"]')
            ?.classList.contains("toolbar-section-collapsed")).toBe(false);

        act(() => {
            window.dispatchEvent(new Event("resize"));
        });
        await act(async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 150));
        });

        expect(aiSection.classList.contains("toolbar-section-collapsed")).toBe(true);
    });

    test("restores all collapsed sections after the toolbar gets wider", async () => {
        const additionalToolbarSections: ToolbarData = new Map([
            ["AI Review", {
                icon: "robot",
                collapsePriority: 0,
                items: [{
                    icon: "robot",
                    text: "Review with AI",
                    onClick: jest.fn()
                }]
            }]
        ]);

        render(
            <TopEditingBar
                {...createProps()}
                additionalToolbarSections={additionalToolbarSections}
            />
        );

        const toolbar = document.getElementById("toolbar");
        if (!toolbar) {
            throw new Error("Expected toolbar element");
        }

        Object.defineProperty(toolbar, "clientWidth", {
            configurable: true,
            value: 500
        });
        Object.defineProperty(toolbar, "scrollWidth", {
            configurable: true,
            get: () => toolbar.querySelectorAll(".toolbar-section-collapsed").length >= 3
                ? 400
                : 1000
        });

        Array.from(toolbar.querySelectorAll("[data-toolbar-section]")).forEach((section) => {
            Object.defineProperty(section, "offsetWidth", {
                configurable: true,
                get: () => section.classList.contains("toolbar-section-collapsed") ? 100 : 200
            });
        });

        act(() => {
            window.dispatchEvent(new Event("resize"));
        });
        await act(async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 150));
        });
        expect(toolbar.querySelectorAll(".toolbar-section-collapsed").length).toBe(3);

        Object.defineProperty(toolbar, "clientWidth", {
            configurable: true,
            value: 2000
        });
        act(() => {
            window.dispatchEvent(new Event("resize"));
        });
        await act(async () => {
            await new Promise((resolve) => window.setTimeout(resolve, 150));
        });

        expect(toolbar.querySelectorAll(".toolbar-section-collapsed").length).toBe(0);
    });

    test("offers sibling duplication in the Clipboard menu", async () => {
        const nodes = assignIds([
            {
                type: Section.type,
                childNodes: [{ type: "Entry" }]
            }
        ] as BasicResumeNode[]);
        const entryUuid = nodes[0].childNodes?.[0]?.uuid;
        if (!entryUuid) {
            throw new Error("Expected entry UUID");
        }

        act(() => {
            resumeNodeStore.setNodes(nodes);
            useEditorStore.getState().selectNode(entryUuid);
        });

        render(<TopEditingBar {...createProps()} />);
        await act(async () => {
            await Promise.resolve();
        });

        act(() => {
            screen.getByText("Clipboard").click();
        });

        expect(screen.getByText("Insert Copy Before")).toBeTruthy();
        expect(screen.getByText("Insert Copy After")).toBeTruthy();
        expect(screen.getByRole("separator")).toBeTruthy();
    });

    test("offers Paste when no node is selected so content can be added to the root", async () => {
        render(<TopEditingBar {...createProps()} />);

        await act(async () => {
            await Promise.resolve();
        });

        expect(screen.getByRole("button", { name: "Paste" })).toBeTruthy();
    });
});
