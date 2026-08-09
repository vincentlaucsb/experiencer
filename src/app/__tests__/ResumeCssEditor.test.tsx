/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import ResumeCssEditor from "@/app/ResumeCssEditor";
import CssNode from "@/shared/CssTree";
import { cssStore, rootCssStore } from "@/shared/stores/cssStoreHooks";
import { resumeNodeStore } from "@/shared/stores/resumeNodeStore";
import { BasicResumeNode } from "@/types";
import { assignIds } from "@/shared/utils/assignIds";

describe("ResumeCssEditor", () => {
    let contactUuid: string;

    beforeEach(() => {
        const header: BasicResumeNode = {
            type: "Header",
            htmlId: "streamline-pro-header",
            childNodes: [{
                type: "Group",
                htmlId: "streamline-pro-contact"
            }]
        };

        const nodes = assignIds([header]);
        contactUuid = nodes[0].childNodes![0].uuid;
        resumeNodeStore.setNodes(nodes);
        cssStore.setCss(new CssNode("Resume CSS", {}, "#resume"));
        rootCssStore.setCss(new CssNode(":root", {}, ":root"));
    });

    test("matches ID rules by selector and displays CSS rules from resume ancestors", async () => {
        cssStore.updateCss((css) => {
            css.addNode(new CssNode(
                "Streamline Pro Header",
                { "margin-bottom": "1rem" },
                "#streamline-pro-header"
            ));
            css.addNode(new CssNode(
                "Contact",
                { "margin-top": "0.5rem" },
                "#streamline-pro-contact"
            ));
        });

        render(<ResumeCssEditor selectedNodeId={contactUuid} />);

        expect(await screen.findByText("Contact")).toBeTruthy();
        expect(screen.getByText("Streamline Pro Header")).toBeTruthy();
        expect(screen.getAllByText("PARENT")).toHaveLength(2);
        expect(screen.getByText((text) => text.includes("#streamline-pro-contact"))).toBeTruthy();
    });

    test("displays component CSS rules from ancestors without HTML IDs", async () => {
        const nodes = assignIds([{
            type: "Section",
            childNodes: [{
                type: "Description List"
            }]
        }]);
        const descriptionListUuid = nodes[0].childNodes![0].uuid;
        resumeNodeStore.setNodes(nodes);
        cssStore.setCss(new CssNode("Resume CSS", {}, "#resume"));
        cssStore.updateCss((css) => {
            css.addNode(new CssNode("Section", { margin: "1rem" }, "section"));
            css.addNode(new CssNode("Description List", {}, "dl"));
        });

        render(<ResumeCssEditor selectedNodeId={descriptionListUuid} />);

        expect(await screen.findByText("Description List")).toBeTruthy();
        expect(screen.getByText("Section")).toBeTruthy();
        expect(screen.getAllByText("PARENT")).toHaveLength(2);
    });
});
