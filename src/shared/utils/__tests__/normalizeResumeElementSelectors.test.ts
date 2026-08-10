import normalizeResumeElementSelectors from "../normalizeResumeElementSelectors";

describe("normalizeResumeElementSelectors", () => {
    test("maps legacy resume element selectors to renderer classes", () => {
        expect(normalizeResumeElementSelectors(
            "resume-entry + resume-entry, #main > resume-column, :is(resume-grid, resume-page-break.page-break-editing), #contact resume-row > *"
        )).toBe(
            ".entry + .entry, #main > .column, :is(.grid-container, .page-break.page-break-editing), #contact .row > *"
        );
    });

    test("does not rewrite class, id, or attribute values with similar names", () => {
        const selector = ".resume-entry, #resume-row, [data-kind=resume-grid], [data-kind=\"resume-column\"]";

        expect(normalizeResumeElementSelectors(selector)).toBe(selector);
    });
});
