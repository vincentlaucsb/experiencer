/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import MarkdownText from "@/resume/Markdown";
import Section from "@/resume/Section";
import pasteFromClipboard from "@/shared/stores/clipboardStore/pasteFromClipboard";
import { useClipboardStore } from "@/shared/stores/clipboardStore/store";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { assignIds } from "@/shared/utils/assignIds";
import { clearToast, useToastStore } from "@/shared/stores/toastStore";

import type { BasicResumeNode, ResumeNode } from "@/types";

beforeAll(() => {
    registerNodes();
});

afterEach(() => {
    resumeNodeStore.setNodes([]);
    useClipboardStore.getState().clearClipboard();
    clearToast();
});

describe("clipboard paste child validation", () => {
    test("paste cannot bypass schema limits", () => {
        const nodes = assignIds([
            {
                type: MarkdownText.type,
                value: "Parent markdown"
            }
        ] as BasicResumeNode[]) as ResumeNode[];

        resumeNodeStore.setNodes(nodes);

        const parentUuid = nodes[0].uuid;
        const invalidClipboardNode = assignIds({ type: Section.type } as BasicResumeNode) as ResumeNode;

        useClipboardStore.getState().setClipboard(invalidClipboardNode);
        pasteFromClipboard(parentUuid);

        const parentAfter = resumeNodeStore.getNodeByUuid(parentUuid);
        expect(parentAfter?.childNodes?.length || 0).toBe(0);
        expect(useToastStore.getState().message).toBe("Section cannot be a child of Markdown.");
        expect(useToastStore.getState().visible).toBe(true);
    });
});
