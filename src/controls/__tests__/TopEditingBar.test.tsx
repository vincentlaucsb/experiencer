/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";

import TopEditingBarWrapper, { TopEditingBar, EditingBarProps } from "@/controls/TopEditingBar";
import MarkdownText from "@/resume/Markdown";
import Section from "@/resume/Section";
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

    test("shows Insert for selected Section node (allows children)", async () => {
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
});
