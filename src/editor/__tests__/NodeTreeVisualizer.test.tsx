/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";

import NodeTreeVisualizer from "@/editor/NodeTreeVisualizer";
import registerNodes from "@/resume/schema";
import { ResumeNode } from "@/types";

registerNodes();

describe("NodeTreeVisualizer", () => {
    test("renders schema-driven node labels and classes", () => {
        const selectNode = jest.fn();
        const nodes = [
            {
                type: "Section",
                uuid: "section-1",
                value: "Experience",
                htmlId: "experience",
                classNames: "primary featured",
                childNodes: [
                    {
                        type: "Entry",
                        uuid: "entry-1",
                        title: ["Acme Corp"],
                    },
                    {
                        type: "Link",
                        uuid: "link-1",
                        value: "Portfolio",
                        url: "https://example.com",
                    },
                    {
                        type: "Image",
                        uuid: "image-1",
                        altText: "Headshot",
                        value: "https://example.com/headshot.png",
                    }
                ]
            }
        ] as ResumeNode[];

        render(
            <NodeTreeVisualizer
                childNodes={nodes}
                selectNode={selectNode}
                selectedNode="entry-1"
            />
        );

        expect(screen.getByText("Experience").closest("span")?.classList.contains("tree-item-section")).toBe(true);
        expect(screen.getByText("Acme Corp").closest("span")?.classList.contains("tree-item-entry")).toBe(true);
        expect(screen.getByText("Portfolio").closest("span")?.classList.contains("tree-item-Link")).toBe(true);
        expect(screen.getByText("Headshot").closest("span")?.classList.contains("tree-item-Image")).toBe(true);
        expect(screen.getByText("#experience.primary.featured")).toBeTruthy();
        expect(screen.getByText("Acme Corp").closest("li")?.classList.contains("tree-item-selected")).toBe(true);

        fireEvent.click(screen.getByText("Portfolio"));
        expect(selectNode).toHaveBeenCalledWith("link-1");
    });

    test("falls back to URL/value/type when custom tree representation fields are missing", () => {
        const nodes = [
            {
                type: "Link",
                uuid: "link-url-only",
                url: "https://fallback.example",
            },
            {
                type: "Image",
                uuid: "image-value-only",
                value: "https://example.com/fallback.png",
            },
            {
                type: "UnknownType",
                uuid: "unknown-1",
            }
        ] as ResumeNode[];

        render(
            <NodeTreeVisualizer
                childNodes={nodes}
                selectNode={() => undefined}
            />
        );

        expect(screen.getByText("https://fallback.example")).toBeTruthy();
        expect(screen.getByText("https://example.com/fallback.png")).toBeTruthy();
        expect(screen.getByText("UnknownType").closest("span")?.classList.contains("tree-item-UnknownType")).toBe(true);
    });
});
