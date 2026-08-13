import html2canvas from "html2canvas";

import {
    captureResumePng,
    normalizeListMarkersForPng
} from "@/shared/utils/ExportPng";
import PageSize from '@/types/PageSize';

jest.mock("html2canvas", () => ({
    __esModule: true,
    default: jest.fn()
}));

test("does not start PNG capture when already cancelled", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
        captureResumePng({
            nodes: [],
            stylesheet: 'body { color: black; }',
            pageSize: PageSize.Letter,
            ariaLabel: 'Resume'
        }, controller.signal)
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(html2canvas).not.toHaveBeenCalled();
});

test("normalizes list markers only in the PNG clone", () => {
    document.body.innerHTML = `
        <div data-resume-document="png">
            <div class="resume-page-boundaries">Editor-only page guide</div>
            <ul><li style="list-style-type: square">First</li><li style="list-style-type: square">Second</li></ul>
        </div>
    `;

    normalizeListMarkersForPng(document);

    const items = Array.from(document.querySelectorAll<HTMLElement>("[data-resume-document] li"));
    expect(document.querySelector(".resume-page-boundaries")).toBeNull();
    expect(items[0].style.listStyleType).toBe("none");
    expect(items[0].querySelector("span")?.textContent).toBe("");
    expect(items[0].querySelector("span")?.style.width).toBe("0.5em");
    expect(items[0].querySelector("span")?.style.height).toBe("0.5em");
    expect(items[0].querySelector("span")?.style.top).toMatch(/px$/);
    expect(items[0].querySelector("span")?.style.transform).toBe("translateY(-50%)");
    expect(items[1].querySelector("span")?.textContent).toBe("");
});
