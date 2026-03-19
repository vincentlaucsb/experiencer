import Group from "@/resume/Group";
import Image, { BasicImageProps, ImageProps } from "@/resume/Image";
import MarkdownText from "@/resume/Markdown";

import { getJoeBlowSignature } from "./AssuredCoveredLetter";
import getDefaultCss from "./CssTemplates";
import { streamlineHeader } from "./Streamline";

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

export function streamlineCoverLetterNodes(): Array<BasicResumeNode> {
    const signature = getJoeBlowSignature();

    return [
        streamlineHeader(),
        {
            type: Group.type,
            htmlId: "content",
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
                    value: signature,
                    alt: "Signature"

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
    const css = getDefaultCss().setProperties({
        "font-family": "var(--sans-serif)",
        "font-size": "var(--body-font-size)",
        "line-height": "var(--body-line-height)"
    });

    /** Header */
    const header = css.mustFindNode("Header").setProperties({
        "margin-bottom": "var(--small-spacing)",
        "padding-bottom": "var(--small-spacing)",
        "padding-top": "var(--edge-margin)",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)",
        "margin-left": "0",
        "margin-right": "0",
        "margin-top": "0"
    }).setProperties({ "margin-right": "auto" }, "Title Group");

    const titleGroup = header.mustFindNode("Title Group");
    titleGroup.add("Headers", { "margin": "0 !important" }, "> *");

    titleGroup.mustFindNode("Title").setProperties({
        "font-family": "var(--sans-serif)",
        "margin": "0 0 var(--x-small-spacing) 0",
        "font-size": "var(--header-title-size)"
    });

    titleGroup.mustFindNode("Subtitle").setProperties({
        "margin": "0",
        "font-size": "var(--header-subtitle-size)",
        "color": "var(--header-subtitle-color)"
    });

    const contact = header.add("#contact", {
        "font-size": "var(--contact-font-size)",
        "margin-top": "var(--x-small-spacing)",
        "line-height": "var(--contact-line-height)"
    });

    const contactText = contact.add("Contact Text", {}, ".text-content");
    contactText.add("Content", { "margin": "0 !important" }, "> p");

    const contactRow = contact.add("Contact Row", {}, "resume-row");

    contactRow.add("Contact Row Items", {
        "display": "inline-flex !important",
        "align-items": "center"
    }, "> .text-content, > .link");

    contactRow.add("Contact Row Separators", {
        "content": "\"•\"",
        "color": "var(--accent)",
        "font-size": "var(--separator-size)",
        "margin": "0 var(--separator-spacing)",
        "opacity": "var(--separator-opacity)"
    }, "> .text-content + .text-content::before, > .link + .link::before");

    /** Cover letter body */
    const content = css.add("#content", {
        "font-family": "var(--sans-serif)",
        "font-size": "12pt",
        "line-height": "1.55",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)",
        "padding-top": "var(--edge-margin)",
        "padding-bottom": "var(--edge-margin)"
    }, "#content");

    content.add("Paragraph", {
        "margin-top": "0",
        "margin-bottom": "1em"
    }, "p").add(":last-of-type", {
        "margin-bottom": "0"
    });

    css.add("#date", {
        "margin-top": "var(--small-spacing)"
    }, "#date");

    css.add("#salutation", {
        "margin-top": "var(--large-spacing)"
    }, "#salutation");

    css.add("#body", {
        "margin-top": "var(--spacing)",
        "margin-bottom": "var(--spacing)"
    }, "#body");

    css.add("#signature", {
        "margin-top": "var(--large-spacing)",
        "margin-bottom": "var(--large-spacing)",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)",
        "text-align": "right",
        "text-size": "12pt"
    }, "#signature").add("Signature", {
        "height": "72px",
        "margin-top": "var(--small-spacing)"
    }, "img");

    return css;
}
