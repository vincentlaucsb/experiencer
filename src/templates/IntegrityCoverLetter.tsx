import Group from "@/resume/Group";
import Header, { BasicHeaderProps } from "@/resume/Header";
import Image, { BasicImageProps } from "@/resume/Image";
import MarkdownText from "@/resume/Markdown";
import { randyMarsh, randyMarshCss } from "./RandyMarsh";
import randyMarshSignature from "./assets/signatures/randy-marsh.png?inline";
import type { BasicResumeNode } from "@/types";

function getCurrentDate(): string {
    const now = new Date();
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

export function integrityCoverLetterNodes(): Array<BasicResumeNode> {
    const [sidebar] = randyMarsh();

    const header = {
        type: Header.type,
        value: "Randy Marsh",
        distribution: "top-to-bottom",
        justifyContent: "center",
        subtitle: "Geologist and Innovator",
        childNodes: []
    } as BasicHeaderProps;

    return [
        sidebar,
        {
            type: "Column",
            htmlId: "main-column",
            childNodes: [
                header,
                {
                    type: Group.type,
                    htmlId: "letter-content",
                    childNodes: [
                        {
                            type: MarkdownText.type,
                            value: getCurrentDate(),
                            htmlId: "date"
                        },
                        {
                            type: MarkdownText.type,
                            value: "Dear Hiring Manager,",
                            htmlId: "salutation"
                        },
                        {
                            type: MarkdownText.type,
                            htmlId: "body",
                            value: `I am writing to apply for this opportunity because I bring a rare combination of geological rigor, entrepreneurial confidence, and a proven ability to turn a modest operation into a full-scale enterprise.

At Tegridy Farms, I pioneered farm-to-door delivery, negotiated a multi-million dollar contract, and learned that every successful organization benefits from clear priorities and a little less panic. My work with the United States Geological Survey taught me to investigate problems thoroughly, while my time in music production taught me to recognize a chart-topping opportunity when I see one.

I would bring that same mix of curiosity, persistence, and unconventional problem-solving to your team. I look forward to discussing how I can help your organization grow, improve, and possibly produce a respectable amount of Tegridy.`
                        }
                    ]
                },
                {
                    type: Group.type,
                    htmlId: "letter-signature",
                    childNodes: [
                        {
                            type: MarkdownText.type,
                            value: "Sincerely,"
                        },
                        {
                            type: Image.type,
                            value: randyMarshSignature,
                            altText: "Handwritten signature of Randy Marsh"
                        } as BasicImageProps,
                        {
                            type: MarkdownText.type,
                            value: "Randy Marsh"
                        }
                    ]
                }
            ]
        }
    ];
}

export function integrityCoverLetterCss() {
    const css = randyMarshCss();

    const content = css.addNode("Letter Content", {
        "font-family": "var(--sans-serif)",
        "font-size": "12pt",
        "line-height": "1.55",
        "padding-top": "var(--large-spacing)"
    }, "#letter-content");

    content.addNode("Letter Paragraphs", {
        "margin": "0 0 1em"
    }, ".text-content p");

    css.addNode("Letter Date", {
        "margin-top": "var(--spacing)"
    }, "#date");

    css.addNode("Letter Salutation", {
        "margin-top": "var(--large-spacing)"
    }, "#salutation");

    css.addNode("Letter Body", {
        "margin-top": "var(--spacing)",
        "margin-bottom": "var(--spacing)"
    }, "#body");

    const signature = css.addNode("Letter Signature", {
        "margin-top": "var(--large-spacing)",
    }, "#letter-signature");
    signature.addNode("Signature Text", {
        "margin": "0"
    }, ".text-content, .text-content p");
    signature.addNode("Signature Image", {
        "display": "block",
        "width": "auto",
        "height": "64px",
        "max-width": "100%",
        "margin": "0.35em 0 0.15em",
        "object-fit": "contain",
        "object-position": "left center"
    }, "img");

    return css;
}
