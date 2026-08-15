import Group from "@/resume/Group";
import Image, { BasicImageProps } from "@/resume/Image";
import MarkdownText from "@/resume/Markdown";

import dineshChugtaiSignature from "./assets/signatures/dinesh-chugtai.png?inline";
import getDefaultCss from "./CssTemplates";
import { addStreamlineHeaderCss, streamlineHeader } from "./Streamline";

import type { BasicResumeNode } from "@/types";

function getCurrentDate(): string {
    const now = new Date();
    const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    return `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
}

export function streamlineCoverLetterNodes(date = getCurrentDate()): Array<BasicResumeNode> {
    return [
        streamlineHeader(),
        {
            type: Group.type,
            htmlId: "content",
            childNodes: [
                {
                    type: MarkdownText.type,
                    value: date,
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
                    value: `I am excited to apply for this role and bring a mix of platform engineering experience, calm incident response, and healthy respect for anything labeled "temporary" in production.

At Pied Piper, I helped architect backend systems that scaled with user growth, survived launch-week chaos, and even reduced cloud costs (without sacrificing reliability or developer sanity). At Hooli, I built analytics tooling, partnered across teams, and learned that alignment meetings are easier when dashboards are actually useful.

I enjoy solving hard technical problems, shipping software that users love, and writing documentation future-me can still understand. I would be thrilled to bring that same energy to your team.

Thank you for your time and consideration.`
                }
            ]
        },
        {
            type: Group.type,
            htmlId: "signature",
            childNodes: [
                {
                    type: MarkdownText.type,
                    value: "Sincerely,"
                },
                {
                    type: Image.type,
                    htmlId: "signature-image",
                    value: dineshChugtaiSignature,
                    altText: "Handwritten signature of Dinesh Chugtai"

                } as BasicImageProps,
                {
                    type: MarkdownText.type,
                    value: "Dinesh Chugtai"
                }
            ]
        }
    ];
}

export function streamlineCoverLetterCss() {
    let css = getDefaultCss().setProperties({
        "font-family": "var(--sans-serif)",
        "font-size": "var(--body-font-size)",
        "line-height": "var(--body-line-height)"
    });

    css = addStreamlineHeaderCss(css);

    /** Cover letter body */
    const content = css.addNode("#content", {
        "font-family": "var(--sans-serif)",
        "font-size": "12pt",
        "line-height": "1.55",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)",
        "padding-top": "var(--edge-margin)",
        "padding-bottom": "var(--edge-margin)"
    }, "#content");

    content.addNode("Paragraph", {
        "margin-top": "0",
        "margin-bottom": "1em"
    }, "p").addNode(":last-of-type", {
        "margin-bottom": "0"
    });

    css.addNode("#date", {
        "margin-top": "var(--small-spacing)"
    }, "#date");

    css.addNode("#salutation", {
        "margin-top": "var(--large-spacing)"
    }, "#salutation");

    css.addNode("#body", {
        "margin-top": "var(--spacing)",
        "margin-bottom": "var(--spacing)"
    }, "#body");

    css.addNode("#signature", {
        "margin-top": "var(--large-spacing)",
        "margin-bottom": "var(--large-spacing)",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)",
        "text-align": "right",
        "font-size": "12pt"
    }, "#signature").addNode("Signature", {
        "display": "block",
        "width": "auto",
        "height": "72px",
        "max-width": "100%",
        "margin": "var(--small-spacing) 0 0.15em auto",
        "object-fit": "contain",
        "object-position": "right center"
    }, "img");

    return css;
}
