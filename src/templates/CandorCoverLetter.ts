import Group from "@/resume/Group";
import Image, { type BasicImageProps } from "@/resume/Image";
import MarkdownText from "@/resume/Markdown";
import type { BasicResumeNode } from "@/types";
import beaSpokeSignature from "./assets/signatures/bea-spoke.png?inline";
import { candorContact, candorCss, candorDescriptionList, candorHeader, candorSkills } from "./Candor";

function getCurrentDate(): string {
    return new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(new Date());
}

function markdown(value: string): BasicResumeNode {
    return { type: MarkdownText.type, value };
}

/**
 * The letter keeps the résumé's main-column-first DOM order: header, letter,
 * then a rail with the contact card and the application reference.
 */
export function candorCoverLetterNodes(date = getCurrentDate()): BasicResumeNode[] {
    return [
        {
            type: "Column",
            htmlId: "candor-main",
            childNodes: [
                candorHeader(false),
                {
                    type: Group.type,
                    htmlId: "candor-letter",
                    childNodes: [
                        markdown("Dear Hiring Team,"),
                        markdown("I am applying for the Senior Product Designer role at Brightpath Health. Patients reach your scheduling and billing tools on difficult days, and I want to help make those moments shorter and calmer."),
                        markdown("At Fernway Outdoor Co., I led the redesign of a gear-rental checkout that had become a maze of upsells and edge cases. Weekly usability sessions with real renters showed where people hesitated; the simplified flow cut abandonment 18% and gave engineering a component library that now powers four products."),
                        markdown("Before that, I designed booking and onboarding flows for small businesses that could not afford to lose a single customer to confusion. That work taught me to treat accessibility and plain language as requirements, not polish, and every launch since has met WCAG 2.1 AA."),
                        markdown("I would welcome the chance to bring that research-led, systems-minded practice to Brightpath's care experience team. Thank you for your time and consideration."),
                        {
                            type: Group.type,
                            htmlId: "candor-signature",
                            childNodes: [
                                markdown("Sincerely,"),
                                {
                                    type: Image.type,
                                    value: beaSpokeSignature,
                                    altText: "Handwritten signature of Bea Spoke"
                                } as BasicImageProps,
                                markdown("Bea Spoke")
                            ]
                        }
                    ]
                }
            ]
        },
        {
            type: "Column",
            htmlId: "candor-rail",
            childNodes: [
                candorContact(),
                {
                    type: "Section",
                    value: "Application",
                    childNodes: [candorDescriptionList([
                        ["Date", [date]],
                        ["Position", ["Senior Product Designer"]],
                        ["Company", ["Brightpath Health"]]
                    ])]
                },
                candorSkills()
            ]
        }
    ];
}

/** Adds the letter body and signature to the shared Candor stylesheet. */
export function candorCoverLetterCss() {
    const css = candorCss();
    const letter = css.mustFindNode("Main Column").addNode("Letter", {
        "margin-top": "var(--space-3)",
        "font-size": "calc(var(--font-size) * 1.08)",
        "line-height": "1.6"
    }, "#candor-letter");
    letter.addNode("Letter Paragraphs", { "margin": "0 0 var(--space-4)" }, "p");
    letter.addNode("Letter Salutation", {
        "font-family": "var(--serif)",
        "font-size": "1.1em",
        "font-weight": "700"
    }, "> .text-content:first-child");

    const signature = letter.addNode("Letter Signature", {
        "margin-top": "var(--space-5)",
        "break-inside": "avoid",
        "page-break-inside": "avoid"
    }, "#candor-signature");
    signature.addNode("Signature Text", { "margin": "0" }, ".text-content, .text-content p");
    signature.addNode("Signature Image", {
        "display": "block",
        "width": "auto",
        "height": "60px",
        "max-width": "100%",
        "margin": "var(--space-2) 0 var(--space-1)",
        "object-fit": "contain",
        "object-position": "left center"
    }, "img");
    return css;
}
