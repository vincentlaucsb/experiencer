/**
 * @jest-environment jsdom
 */
import registerNodes from "@/resume/schema";
import MarkdownText from "@/resume/Markdown";
import Section from "@/resume/Section";
import NodeStore from "@/shared/stores/NodeStore";
import { assignIds } from "@/shared/utils/assignIds";
import { clearToast, useToastStore } from "@/shared/stores/toastStore";

import type { BasicResumeNode, ResumeNode } from "@/types";

beforeAll(() => {
    registerNodes();
});

describe("NodeStore child validation", () => {
    afterEach(() => {
        clearToast();
    });

    test("blocks invalid child insertion and shows toast", () => {
        const store = new NodeStore();

        const nodes = assignIds([
            {
                type: MarkdownText.type,
                value: "Parent markdown"
            }
        ] as BasicResumeNode[]) as ResumeNode[];

        store.setNodes(nodes);

        const parentUuid = nodes[0].uuid;
        const invalidChild = assignIds({ type: Section.type } as BasicResumeNode) as ResumeNode;

        store.addNode(parentUuid, invalidChild);

        const parentAfter = store.getNodeByUuid(parentUuid);
        expect(parentAfter?.childNodes?.length || 0).toBe(0);
        expect(useToastStore.getState().message).toBe("Section cannot be a child of Markdown.");
        expect(useToastStore.getState().visible).toBe(true);
    });

    test("allows valid child insertion", () => {
        const store = new NodeStore();

        const nodes = assignIds([
            {
                type: Section.type,
                childNodes: []
            }
        ] as BasicResumeNode[]) as ResumeNode[];

        store.setNodes(nodes);

        const parentUuid = nodes[0].uuid;
        const validChild = assignIds({
            type: MarkdownText.type,
            value: "Child markdown"
        } as BasicResumeNode) as ResumeNode;

        store.addNode(parentUuid, validChild);

        const parentAfter = store.getNodeByUuid(parentUuid);
        expect(parentAfter?.childNodes?.length).toBe(1);
        expect(parentAfter?.childNodes?.[0]?.type).toBe(MarkdownText.type);
    });
});
