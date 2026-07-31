/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import OverlayEditor from "@/resume/infrastructure/OverlayEditor";

describe("OverlayEditor", () => {
    test("keeps the structural overlay class when a feature class is provided", () => {
        const triggerElement = document.createElement("div");
        document.body.appendChild(triggerElement);

        render(
            <OverlayEditor
                triggerElement={triggerElement}
                isOpen={true}
                className="container-overlay-editor"
            >
                <span>Editing controls</span>
            </OverlayEditor>
        );

        const overlay = screen.getByText("Editing controls").parentElement;

        expect(overlay?.classList.contains("overlay-editor")).toBe(true);
        expect(overlay?.classList.contains("container-overlay-editor")).toBe(true);

        triggerElement.remove();
    });
});
