import Group from "@/resume/Group";
import Image, { type BasicImageProps } from "@/resume/Image";
import MarkdownText from "@/resume/Markdown";
import type { BasicResumeNode } from "@/types";
import anaLyticsSignature from "./assets/signatures/ana-lytics.png?inline";
import { earnestCss, earnestDescriptionList, earnestHeader, earnestTabRule, styleInlineFacts } from "./Earnest";

function getCurrentDate(): string {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
}

function markdown(value: string): BasicResumeNode {
    return { type: MarkdownText.type, value };
}

/** The letter reuses the résumé header, then a ruled application reference and one calm prose column. */
export function earnestCoverLetterNodes(date = getCurrentDate()): BasicResumeNode[] {
    return [
        earnestHeader(false),
        {
            type: Group.type,
            htmlId: "earnest-reference",
            childNodes: [earnestDescriptionList([
                ["Date", [date]],
                ["Position", ["Data Analyst"]],
                ["Organization", ["Harborview Transit Authority"]]
            ])]
        },
        {
            type: Group.type,
            htmlId: "earnest-letter",
            childNodes: [
                markdown("Dear Hiring Team,"),
                markdown("I am applying for the Data Analyst position at Harborview Transit Authority. I graduate in May 2027 with a B.S. in Information Science, and the questions your planning team works on, such as crowding, reliability, and where riders actually travel, are the ones I have spent the past year learning to measure."),
                markdown("As a data analytics intern at Northfield Regional Health, I rebuilt a weekly occupancy report that took six hours to assemble by hand. The Power BI version refreshes in under an hour, and the SQL checks I added caught 1,200 duplicate records before a state filing. The internship taught me to ask which decision a report supports before choosing a chart."),
                markdown("In a personal project, I combined 18 months of campus bus GPS data with class schedules to show crowding by hour. Student Government used the dashboard to propose a new route, and I presented the findings to the university’s transportation office."),
                markdown("I would welcome the chance to bring the same care to Harborview’s ridership and service planning work. Thank you for considering my application."),
                {
                    type: Group.type,
                    htmlId: "earnest-signature",
                    childNodes: [
                        markdown("Sincerely,"),
                        {
                            type: Image.type,
                            value: anaLyticsSignature,
                            altText: "Handwritten signature of Ana Lytics"
                        } as BasicImageProps,
                        markdown("Ana Lytics")
                    ]
                }
            ]
        }
    ];
}

/** Adds the reference line, letter body, and signature to the shared Earnest stylesheet. */
export function earnestCoverLetterCss() {
    const css = earnestCss();
    // A wider side margin gives the prose a comfortable measure under the centered header.
    css.setProperties((current) => new Map([
        ...current,
        ["padding", "var(--page-margin-block) var(--letter-margin-inline)"]
    ]));

    const reference = css.addNode("Letter Reference", {
        "margin": "0 0 var(--space-5)",
        "padding": "0 0 var(--space-2)",
        ...earnestTabRule()
    }, "#earnest-reference");
    styleInlineFacts(reference.addNode("Reference Facts", {}, "dl"));

    // The letter overrides the leading token so measurements derived from it, such as bullet dashes, follow.
    const letter = css.addNode("Letter", {
        "--line-height": "1.5",
        "line-height": "var(--line-height)"
    }, "#earnest-letter");
    letter.addNode("Letter Paragraphs", { "margin": "0 0 var(--space-4)" }, "p");
    letter.addNode("Letter Lists", { "margin": "0 0 var(--space-4)" }, "ul, ol");

    const signature = letter.addNode("Letter Signature", {
        "margin-top": "var(--space-5)",
        "break-inside": "avoid",
        "page-break-inside": "avoid"
    }, "#earnest-signature");
    signature.addNode("Signature Text", { "margin": "0" }, ".text-content, .text-content p");
    signature.addNode("Signature Image", {
        "display": "block",
        "width": "auto",
        "height": "56px",
        "max-width": "100%",
        "margin": "var(--space-2) 0 var(--space-1)",
        "object-fit": "contain",
        "object-position": "left center"
    }, "img");
    return css;
}
