/**
 * @jest-environment jsdom
 */
import { act, render, screen } from "@testing-library/react";

import MarkdownText from "@/resume/Markdown";
import { configureMarkdownEditor, resetMarkdownEditor } from "@/resume/markdownEditor";
import { useEditorStore } from "@/shared/stores/editorStore";
import type ResumeComponentProps from "@/types";

afterEach(() => {
    act(() => {
        useEditorStore.getState().unselectNode();
    });
    resetMarkdownEditor();
});

test("explains Markdown support in the text editor", () => {
    const uuid = "markdown-editor-1";
    const props: ResumeComponentProps = {
        type: MarkdownText.type,
        uuid,
        id: [],
        isLast: true,
        value: "",
        updateData: jest.fn(),
        updateDataFields: jest.fn()
    };

    act(() => {
        useEditorStore.getState().editNode(uuid);
    });

    render(<MarkdownText {...props} />);

    const markdownLink = screen.getByRole("link", { name: "Learn what Markdown is" });
    expect(markdownLink.getAttribute("href")).toBe("https://www.markdownguide.org/getting-started/");
    expect(markdownLink.getAttribute("target")).toBe("_blank");
    expect(screen.getByText("is supported.")).toBeTruthy();
});

test("uses a registered Markdown editor adapter", () => {
    configureMarkdownEditor(({ value, onChange, id, ariaLabel }) => (
        <input
            data-testid="registered-markdown-editor"
            id={id}
            aria-label={ariaLabel}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    ));

    const uuid = "markdown-editor-adapter";
    const props: ResumeComponentProps = {
        type: MarkdownText.type,
        uuid,
        id: [],
        isLast: true,
        value: "**Adapter test**",
        updateData: jest.fn(),
        updateDataFields: jest.fn()
    };

    act(() => {
        useEditorStore.getState().editNode(uuid);
    });

    render(<MarkdownText {...props} />);

    expect(screen.getByTestId("registered-markdown-editor")).toBeTruthy();
});
