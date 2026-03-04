import { BasicHeaderProps } from "@/resume/Header";
import { BasicEntryProps } from "@/resume/Entry";
import { makeList } from "./TemplateHelper";
import { BasicIconProps } from "@/resume/Icon";
import getDefaultCss, { getRootCss } from "./CssTemplates";
import CssNode from "@/shared/CssTree";
import { BasicResumeNode } from "@/types";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";

export function assuredCss() {
    let css = getDefaultCss().setProperties({
        "font-family": "var(--sans-serif)",
        "font-size": "11pt"
    });

    css.add('Icon', {
        'display': 'inline-block',
        'vertical-align': 'middle'
    }, '.icon');

    css.add('Markdown Lists', {
        'padding-left': 'var(--spacing)'
    }, '.text-content ul, .text-content ol');

    /** Header */
    const header = css.mustFindNode("Header").setProperties({
        "background": "#e8e8e8",
        "margin-bottom": "var(--large-spacing)",
        "padding-left": "var(--edge-margin)",
        "padding-right": "var(--edge-margin)",
        "padding-top": "var(--x-large-spacing)",
        "padding-bottom": "var(--large-spacing)",
    }).setProperties({"margin-right": "auto"}, 'Title Group'
    );

    /** Contact Information */
    let contact = css.add("Contact Information", {
        "grid-template-columns": "1fr 30px",
        "grid-column-gap": "var(--small-spacing)",
        "margin-left": "var(--spacing)",
        "width": "auto",
        "height": "auto",
    }, "#contact, #social-media");
    
    contact.add('Text', {
        'text-align': 'right',
        'font-size': '0.8rem',
        'margin': '0',
        'line-height': '24px'
    }, '.link, .text-content, p');

    contact.add('Icon', {
        'height': '24px',
        'vertical-align': 'middle'
    }, 'svg.icon, img.icon');

    /** Section */
    css.mustFindNode('Section').setProperties({
        'margin-bottom': 'var(--xx-large-spacing)'
        }).setProperties({
            'padding-top': 'var(--small-spacing)'
        }, 'Content'
        ).setProperties({
            "font-family": "var(--serif)",
            "font-weight": "700",
            "font-size": "18pt",
            "color": "var(--accent)"
        }, 'Title');

    /** Grid */
    css.add('#main', {
        'padding-left': 'var(--edge-margin)',
        'padding-right': 'var(--edge-margin)',
        'grid-template-columns': '1fr 200px',
        'grid-column-gap': 'var(--large-spacing)'
    });

    const sidebar = css.add('#sidebar', {});
    sidebar.add('Last Subtitle Field', {
        'margin-left': '0'
    }, 'resume-entry > hgroup > h4 span.field-last');

    const subtitleFields = css.findNode(["Entry", "Title Block", "Subtitle"]);
    if (subtitleFields) {
        subtitleFields.mustFindNode("Middle Fields").add(":before", {
            content: '"|"',
            padding: "0 0.6em"
        });

        subtitleFields.setProperties({
            "margin-left": "auto",
            "text-align": "right"
        }, "Last Field");
    }

    return css;
}

export function assuredRootCss(): CssNode {
    return getRootCss().setProperties((current) => {
        const next = new Map<string, string>(current);
        next.set('--accent', '#315eaa');
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
                "subtitle": ["Software Engineer", "San Francisco, CA", "September 2016 -- Present"],
                "childNodes": [
                    makeList([
                        'Did things while looking at a computer monitor'
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