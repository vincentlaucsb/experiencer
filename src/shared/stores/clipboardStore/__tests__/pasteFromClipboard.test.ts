/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import ComponentTypes from "@/resume/schema/ComponentTypes";
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
        const sectionLabel = ComponentTypes.instance.defaultValue(Section.type).text;
        const markdownLabel = ComponentTypes.instance.defaultValue(MarkdownText.type).text;
        expect(useToastStore.getState().message).toBe(`${sectionLabel} cannot be a child of ${markdownLabel}.`);
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

    test("pastes a valid node directly into the resume root", () => {
        resumeNodeStore.setNodes([]);

        const rootClipboardNode = assignIds({
            type: Section.type,
            value: "Pasted section"
        } as BasicResumeNode) as ResumeNode;

        useClipboardStore.getState().setClipboard(rootClipboardNode);
        pasteFromClipboard(undefined);

        expect(resumeNodeStore.data.childNodes).toHaveLength(1);
        expect(resumeNodeStore.data.childNodes[0]).toMatchObject({
            type: Section.type,
            value: "Pasted section"
        });
        expect(useHistoryStore.getState().past).toHaveLength(1);
        expect(useToastStore.getState().visible).toBe(false);
    });
});
