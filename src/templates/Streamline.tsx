import { BasicHeaderProps } from "@/resume/Header";
import { BasicEntryProps } from "@/resume/Entry";
import { makeList } from "./TemplateHelper";
import getDefaultCss, { getRootCss } from "./CssTemplates";
import CssNode from "@/shared/CssTree";
import { BasicResumeNode } from "@/types";
import MarkdownText from "@/resume/Markdown";
import Link from "@/resume/Link";

export function streamlineCss() {
    let css = getDefaultCss().setProperties([
        ["font-family", "var(--sans-serif)"],
        ["font-size", "11pt"],
        ["line-height", "1.4"]
    ]);

    css.add('Markdown Lists', {
        'padding-left': '20px',
        'margin': '0.15em 0',
        'list-style-type': 'disc'
    }, '.text-content ul, .text-content ol');

    css.add('List Items', {
        'margin': '0.1em 0'
    }, '.text-content li');

    /** Header */
    const header = css.mustFindNode("Header").setProperties([
        ["border-bottom", "1.5px solid var(--accent)"],
        ["margin-bottom", "0.5em"],
        ["padding-bottom", "0.5em"],
        ["padding-top", "var(--edge-margin)"],
        ["padding-left", "var(--edge-margin)"],
        ["padding-right", "var(--edge-margin)"],
        ["margin-left", "0"],
        ["margin-right", "0"],
        ["margin-top", "0"]
    ]).setProperties([["margin-right", "auto"]], 'Title Group'
    );

    header.add('Title', {
        'margin': '0 0 0.2em 0',
        'font-size': '28pt',
        'text-align': 'center'
    }, 'h1');

    header.add('Subtitle', {
        'margin': '0 0 0.4em 0',
        'font-size': '11pt',
        'color': '#333333'
    }, 'h2');

    header.add('Contact Information', {
        'font-size': '10pt',
        'margin-top': '0.3em',
        'line-height': '1.4'
    }, '#contact, #social-media');

    header.add('Contact Text', {
        'display': 'block',
        'margin-bottom': '0.15em'
    }, '#contact .text-content, #contact p');

    header.add('Social Media', {
        'display': 'inline',
        'margin-right': '1em'
    }, '#social-media .link');

    header.add('Social Separator', {
        'display': 'none'
    }, '#social-media .text-content, #social-media p');

    /** Section */
    css.mustFindNode('Section').setProperties([
        ['margin-bottom', '0.5em'],
        ['margin-top', '0.5em']
    ]).setProperties([
        ['padding-top', '0'],
        ['padding-bottom', '0.2em']
    ], 'Content'
    ).setProperties([
        ["font-family", "var(--sans-serif)"],
        ["font-weight", "700"],
        ["font-size", "12pt"],
        ["color", "var(--accent)"],
        ["border-bottom", "1px solid #d0d0d0"],
        ["margin-bottom", "0.35em"],
        ["padding-bottom", "0.15em"],
        ["margin-top", "0"]
    ], 'Title');

    /** Entry */
    css.mustFindNode('Entry').setProperties([
        ['display', 'block'], // TODO: Create setProperties that merges with existing properties instead of overwriting
        ['margin-bottom', '0.4em'],
        ['margin-top', '0']
    ]);

    const titleBlock = css.findNode(["Entry", "Title Block"]);
    if (titleBlock) {
        titleBlock.setProperties([
            ["margin-bottom", "0.1em"],
            ["margin-top", "0"]
        ]);

        titleBlock.mustFindNode('Title').setProperties([
            ["font-weight", "700"],
            ["font-size", "11pt"],
            ["margin", "0"],
            ["display", "inline"]
        ], 'h3');

        titleBlock.mustFindNode('Subtitle').setProperties([
            ["font-size", "10pt"],
            ["color", "#444444"],
            ["margin", "0"],
            ["display", "flex"],
            ["gap", "1em"],
            ["margin-top", "0.05em"],
            ["font-weight", "500"],
            ["flex-wrap", "wrap"],
            ["justify-content", "space-between"]
        ]);

        titleBlock.add('Subtitle Fields', {
            'display': 'inline-block'
        }, '.field');
    }

    /** Main Grid - Single Column */
    css.add('#main', {
        'grid-template-columns': '1fr',
        'padding-left': 'var(--edge-margin)',
        'padding-right': 'var(--edge-margin)',
        'padding-top': '0',
        'padding-bottom': '0'
    });

    return css;
}

export function streamlineRootCss(): CssNode {
    return getRootCss().updateProperties([
        ['--accent', '#2c3e50'],
        ['--edge-margin', '0.4in'],
        ['--large-spacing', '0.4em'],
        ['--x-large-spacing', '0.6em'],
        ['--xx-large-spacing', '0.8em'],
        ['--spacing', '0.4em']
    ]);
}

export function streamlineHeader() {
    let contact = {
        "type": "Grid",
        "htmlId": "contact",
        childNodes: [
            {
                type: MarkdownText.type,
                value: "(650) 253-0961"
            },
            {
                type: MarkdownText.type,
                value: "dinesh@piedpiper.com"
            },
            {
                type: MarkdownText.type,
                value: "Mountain View, CA"
            }
        ]
    };

    let socialMedia = {
        "type": "Grid",
        "htmlId": "social-media",
        childNodes: [
            {
                type: Link.type,
                value: "github.com/dineshchugtai"
            },
            {
                type: Link.type,
                value: "linkedin.com/in/dineshchugtai"
            },
            {
                type: Link.type,
                value: "dineshchugtai.io"
            }
        ]
    };

    return {
        "type": "Header",
        "value": "**Dinesh** Chugtai",
        "childNodes": [contact, socialMedia],
        "subtitle": "Platform Engineer & Blockchain Enthusiast",
        "justifyContent": "flex-start",
        "distribution": "top-to-bottom"
    } as BasicHeaderProps;
}

export function streamlineNodes(): Array<BasicResumeNode> {
    let experience = {
        "type": "Section",
        "value": "Experience",
        "childNodes": [
            {
                "type": "Entry",
                "title": ["Pied Piper"],
                "subtitle": ["Vice President of Architecture", "Mountain View, CA", "July 2015 -- Present"],
                "childNodes": [
                    makeList([
                        'Single-handedly architected the entire backend infrastructure (with significant help from Gilfoyle)',
                        'Implemented custom data compression algorithm that may or may not violate existing patents',
                        'Negotiated cloud costs down 12% through aggressive Slack arguments',
                        'Mentored junior developers on proper code review etiquette and stack overflow citation techniques'
                    ])
                ]
            } as BasicEntryProps,
            {
                "type": "Entry",
                "title": ["Hooli"],
                "subtitle": ["Senior Systems Engineer", "Mountain View, CA", "June 2014 -- June 2015"],
                "childNodes": [
                    makeList([
                        'Developed real-time analytics dashboard that executives never actually used',
                        'Led five-person team (two of whom were interns)',
                        'Implemented monolithic caching layer before learning about Redis',
                        'Attended every tech talk and remembered approximately 3% of the content'
                    ])
                ]
            } as BasicEntryProps
        ]
    } as BasicResumeNode;

    let education = {
        "type": "Section",
        "value": "Education",
        childNodes: [
            {
                "type": "Entry",
                "title": ["UC Berkeley"],
                "subtitle": ["B.S. Electrical Engineering and Computer Sciences", "2014", "GPA: 3.7 (mostly)"],
                "childNodes": []
            } as BasicEntryProps
        ]
    };

    let skills = {
        "type": "Section",
        "value": "Skills",
        childNodes: [makeList([
            "Languages: Python, Go, Rust, Java, C++, JavaScript (ironically)",
            "Frameworks: React, Node.js, Django, FastAPI, whatever's trending on HN",
            "Databases: PostgreSQL, MongoDB, Redis, that one NoSQL thing from 2009",
            "Tools & Platforms: Docker, Kubernetes, AWS, GCP, Linux, VIM (but I use nano)",
            "Soft Skills: Debating on message boards, passive-aggressive code reviews, finding bugs in other people's work"
        ])]
    };

    return [
        streamlineHeader(),
        {
            "type": "Grid",
            "htmlId": "main",
            childNodes: [
                {
                    "type": "Column",
                    childNodes: [
                        experience,
                        education,
                        skills
                    ]
                }
            ]
        }
    ];
}
