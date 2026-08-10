const LEGACY_RESUME_ELEMENT_SELECTOR =
    /(^|[\s>+~,(])(resume-(?:column|entry|grid|page-break|row))(?=$|[\s>+~,.#:[\]()])/g;

const standardSelectors: Record<string, string> = {
    "resume-column": ".column",
    "resume-entry": ".entry",
    "resume-grid": ".grid-container",
    "resume-page-break": ".page-break",
    "resume-row": ".row"
};

/** Keeps CSS serialized by older releases working with the standard HTML renderer. */
export default function normalizeResumeElementSelectors(selector: string): string {
    return selector.replace(
        LEGACY_RESUME_ELEMENT_SELECTOR,
        (_match, prefix: string, legacySelector: string) =>
            `${prefix}${standardSelectors[legacySelector]}`
    );
}
