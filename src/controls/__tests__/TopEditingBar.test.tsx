/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";

import { TopEditingBar, EditingBarProps } from "@/controls/TopEditingBar";
import MarkdownText from "@/resume/Markdown";
import Section from "@/resume/Section";
import registerNodes from "@/resume/schema";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { useEditorStore } from "@/shared/stores/editorStore";
import { assignIds } from "@/shared/utils/assignIds";
import { BasicResumeNode, NodeProperty, ResumeNode } from "@/types";

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
});
