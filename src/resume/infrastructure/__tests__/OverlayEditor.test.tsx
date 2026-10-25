/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import OverlayEditor, { fitOverlayToViewport, OVERLAY_VIEWPORT_MARGIN_PX as margin } from "@/resume/infrastructure/OverlayEditor";

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

describe("fitOverlayToViewport", () => {
    test("leaves an overlay that already fits where it is", () => {
        expect(fitOverlayToViewport({ left: 200, right: 700 }, 484, 1280, 0)).toEqual({ offsetX: 0, maxWidth: 1280 - margin * 2 - 16 });
    });

    test("caps a letter-width trigger to the phone and pulls the bleed inside the left margin", () => {
        // An 814px node at x=0 with a shell bleeding 16px left of the overlay box.
        const fit = fitOverlayToViewport({ left: -16, right: 814 }, 814, 390, 0);
        expect(fit.maxWidth).toBe(390 - margin * 2 - 16);
        expect(fit.offsetX).toBe(margin + 16);

        // Re-measuring after the nudge settles on the same fit.
        const settled = fitOverlayToViewport({ left: margin, right: margin + 374 }, 358, 390, fit.offsetX);
        expect(settled).toEqual(fit);
    });

    test("shifts an overlay that would run off the right edge back on screen", () => {
        const fit = fitOverlayToViewport({ left: 300, right: 660 }, 360, 390, 0);
        expect(300 + fit.offsetX + 360).toBe(390 - margin);
    });
});
