import { BasicHeaderProps } from "@/resume/Header";
import { BasicEntryProps } from "@/resume/Entry";
import { makeList } from "./TemplateHelper";
import { BasicIconProps } from "@/resume/Icon";
import getDefaultCss, { getRootCss } from "./CssTemplates";
import CssNode from "@/shared/CssTree";
import { BasicResumeNode } from "@/types";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";

/** Applies the shared Assured header and contact treatment to either document variant. */
export function addAssuredHeaderCss(css: CssNode): CssNode {
    css.addNode('Icon', {
        'display': 'inline-block',
        'vertical-align': 'middle'
    }, '.icon');

    const header = css.mustFindNode("Header").setProperties({
        "background": "#e8e8e8",
        "margin-bottom": "var(--large-spacing)",
        "padding": "var(--header-padding)",
        "gap": "var(--small-spacing)"
    });

    header.mustFindNode('Title Group').setProperties({
        "margin-right": "auto"
    });
    header.mustFindNode('Title Group').mustFindNode('Title').setProperties({
        "font-family": "var(--serif)",
        "font-weight": "normal",
        "line-height": "1.05"
    });
    header.mustFindNode('Title Group').mustFindNode('Subtitle').setProperties({
        "font-family": "var(--sans-serif)",
        "font-weight": "normal",
        "line-height": "1.1",
        "margin-top": "0.12em"
    });

    const contact = css.addNode("Contact Information", {
        "grid-template-columns": "minmax(0, 1fr) 24px",
        "grid-column-gap": "0.45em",
        "grid-row-gap": "0.1em",
        "align-items": "center",
        "margin-left": "var(--spacing)",
        "width": "auto",
        "height": "auto"
    }, "#contact, #social-media");

    contact.addNode('Text', {
        'text-align': 'right',
        'font-size': '0.8rem',
        'margin': '0',
        'line-height': '24px',
        'white-space': 'nowrap'
    }, '.link, .text-content, p');

    contact.addNode('Icon', {
        'height': '22px',
        'width': '22px',
        'vertical-align': 'middle'
    }, 'svg.icon, img.icon');

    return css;
}

export function assuredCss() {
    let css = getDefaultCss().setProperties({
        "font-family": "var(--sans-serif)",
        "font-size": "11pt"
    });

    addAssuredHeaderCss(css);

    css.addNode('Markdown Lists', {
        'padding-left': 'var(--spacing)'
    }, '.text-content ul, .text-content ol');

    /** Section */
    css.mustFindNode('Section').setProperties({
        'margin-bottom': 'var(--x-large-spacing)'
        }).setProperties({
            'padding-top': 'var(--small-spacing)'
        }, 'Content'
        ).setProperties({
            "font-family": "var(--serif)",
            "font-weight": "700",
            "font-size": "17pt",
            "color": "var(--accent)"
        }, 'Title');

    /** Grid */
    css.addNode('#main', {
        'padding-left': 'var(--edge-margin)',
        'padding-right': 'var(--edge-margin)',
        'grid-template-columns': 'minmax(0, 1fr) minmax(180px, 200px)',
        'grid-column-gap': 'var(--large-spacing)',
        'align-items': 'start'
    });

    const sidebar = css.addNode('#sidebar', {});
    sidebar.addNode('Last Subtitle Field', {
        'margin-left': '0'
    }, 'resume-entry > hgroup > h4 span.field-last');

    const subtitleFields = css.findNode(["Entry", "Title Block", "Subtitle"]);
    if (subtitleFields) {
        subtitleFields.mustFindNode("Middle Fields").addNode(":before", {
            content: '"|"',
            padding: "0 0.6em"
        });

        subtitleFields.setProperties({
            "color": "#555555",
            "font-size": "0.92em",
            "margin-left": "auto",
            "padding-left": "var(--spacing)",
            "text-align": "right"
        }, "Last Field");

        subtitleFields.setProperties({
            "color": "#555555",
            "font-size": "0.92em",
            "column-gap": "var(--spacing)"
        });
    }

    return css;
}

export function assuredRootCss(): CssNode {
    return getRootCss().setProperties((current) => {
        const next = new Map<string, string>(current);
        next.set('--accent', '#315eaa');
        next.set('--header-padding', '0.25in var(--edge-margin) 0.15in');
        return next;
    });
}

export function assuredHeader() {
    let contact = {
        "type": "Grid",
        "htmlId": "contact",
        childNodes: [
            {
                type: MarkdownText.type,
                value: "(123) 456-7890"
            },
            {
                type: "Icon",
                icon: "phone"
            } as BasicIconProps,
            {
                type: MarkdownText.type,
                value: "mynameis@mail.com"
            },
            {
                type: "Icon",
                icon: "email"
            } as BasicIconProps,
            {
                type: MarkdownText.type,
                value: "Sometown, USA"
            },
            {
                type: "Icon",
                icon: "map-pin"
            } as BasicIconProps
        ]
    }

    let socialMedia = {
        "type": "Grid",
        "htmlId": "social-media",
        childNodes: [
            {
                type: Link.type,
                value: "My GitHub"
            },
            {
                type: "Icon",
                icon: "github"
            } as BasicIconProps,
            {
                type: Link.type,
                value: "mylinkedin"
            },
            {
                type: "Icon",
                icon: "linkedin"
            } as BasicIconProps,
            {
                type: Link.type,
                value: "mywebsite.com"
            },
            {
                type: "Icon",
                icon: "globe"
            } as BasicIconProps
        ]
    }

    return {
        "type": "Header",
        "value": "**Solid** Programmer",
        "childNodes": [contact, socialMedia],
        "subtitle": "Software Engineer",
        "justifyContent": "flex-end",
        "distribution": "left-to-right"
    } as BasicHeaderProps;

}

export function assuredNodes(): Array<BasicResumeNode> {
    let experience = {
        "type": "Section",
        "value": "Experience",
        "childNodes": [
            {
                "type": "Entry",
                "title": ["Some Startup"],
                "subtitle": ["Software Engineer", "San Francisco, CA", "September 2016 -- 2020"],
                "childNodes": [
                    makeList([
                        'Did things while looking at a computer monitor'
                    ])
                ]
            } as BasicEntryProps,
            {
                "type": "Entry",
                "title": ["Some Other Startup"],
                "subtitle": ["Senior Software Engineer", "Oakland, CA", "2020 -- Present"],
                "childNodes": [
                    makeList([
                        'Kept the servers running by refreshing the page with confidence'
                    ])
                ]
            } as BasicEntryProps
        ]
    } as BasicResumeNode;

    let projects = {
        "type": "Section",
        childNodes: [
            {
                "type": "Entry",
                "title": ["Roomba Ruler"],
                childNodes: [
                    makeList([
                        'Created an app which allows you to control a swarm of room-cleaning robots'
                    ])
                ]
            },
            {
                "type": "Entry",
                "title": ["Creepy Santa"],
                childNodes: [
                    makeList([
                        "Created an app which allows you to view your crush's Amazon wish list"
                    ])
                ]
            },
            {
                "type": "Entry",
                "title": ["Snack Overflow"],
                "subtitle": ["Tech stack: React, TypeScript, and CSS"],
                childNodes: [
                    makeList([
                        'Built a dashboard for tracking office snacks before they mysteriously disappear'
                    ])
                ]
            }
        ],
        "value": "Projects"
    };

    let education = {
        "type": "Section",
        "value": "Education",
        childNodes: [
            {
                "type": "Entry",
                "title": ["Some College"],
                "subtitle": ["BA Mathematics", "2018", "3.99 GPA"],
                "subtitleBreaks": [1],
                "childNodes": []
            } as BasicEntryProps
        ]
    };

    return [
        assuredHeader(),
        {
            "type": "Grid",
            "htmlId": "main",
            childNodes: [
                {
                    "type": "Column",
                    childNodes: [
                        experience,
                        projects
                    ]
                },
                {
                    "type": "Column",
                    childNodes: [
                        education,
                        {
                            "type": "Section",
                            "value": "Languages",
                            childNodes: [makeList([
                                "COBOL",
                                "Pascal"
                            ])]
                        }
                    ],
                    "htmlId": "sidebar"
                }
            ]
        }
    ];
}
