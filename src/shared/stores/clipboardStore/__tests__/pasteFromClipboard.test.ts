/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import MarkdownText from "@/resume/Markdown";
import Section from "@/resume/Section";
import pasteFromClipboard from "@/shared/stores/clipboardStore/pasteFromClipboard";
import { useClipboardStore } from "@/shared/stores/clipboardStore/store";
import { useHistoryStore } from "@/shared/stores/historyStore";
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
    useHistoryStore.getState().clear();
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
        expect(useHistoryStore.getState().past.length).toBe(0);
    });

    test("valid paste records history", () => {
        const nodes = assignIds([
            {
                type: Section.type,
                childNodes: []
            }
        ] as BasicResumeNode[]) as ResumeNode[];

        resumeNodeStore.setNodes(nodes);

        const parentUuid = nodes[0].uuid;
        const validClipboardNode = assignIds({
            type: MarkdownText.type,
            value: "Pasted child"
        } as BasicResumeNode) as ResumeNode;

        useClipboardStore.getState().setClipboard(validClipboardNode);
        pasteFromClipboard(parentUuid);

        expect(useHistoryStore.getState().past.length).toBe(1);
    });
});
