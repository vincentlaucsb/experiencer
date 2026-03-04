import CssNode from "@/shared/CssTree";
import getDefaultCss, { getRootCss } from "./CssTemplates";
import { makeList } from "./TemplateHelper";

import Link from "@/resume/Link";
import MarkdownText from "@/resume/Markdown";

import type { BasicEntryProps } from "@/resume/Entry";
import type { BasicHeaderProps } from "@/resume/Header";
import type { LinkProps } from "@/resume/Link";
import type { RowProps } from "@/resume/Row";
import type { BasicResumeNode } from "@/types";

export function streamlineCss() {
    let css = getDefaultCss().setProperties({
        "font-family": "var(--sans-serif)",
        "font-size": "var(--body-font-size)",
        "line-height": "var(--body-line-height)"
    });

    css.add('Markdown Lists', {
        'padding-left': 'var(--list-indent)',
        'margin': 'var(--xx-small-spacing) 0',
        'list-style-type': 'disc'
    }, '.text-content ul, .text-content ol');

    css.add('List Items', {
        'margin': 'var(--list-item-spacing) 0'
    }, '.text-content li');

    css.add('List Markers', {
        'font-size': 'var(--list-marker-size)'
    }, '.text-content li::marker');

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
    }).setProperties({"margin-right": "auto"}, 'Title Group');
    
    const titleGroup = header.mustFindNode('Title Group');
    titleGroup.add('Headers', { 'margin': '0 !important' }, '> *');
    titleGroup.mustFindNode('Title').setProperties({
        'font-family': 'var(--sans-serif)',
        'margin': '0 0 var(--x-small-spacing) 0',
        'font-size': 'var(--header-title-size)',
    });
    titleGroup.mustFindNode('Subtitle').setProperties({
        'margin': '0',
        'font-size': 'var(--header-subtitle-size)',
        'color': 'var(--header-subtitle-color)'
    });

    const contact = header.add('#contact', {
        'font-size': 'var(--contact-font-size)',
        'margin-top': 'var(--x-small-spacing)',
        'line-height': 'var(--contact-line-height)'
    });

    const contactText = contact.add('Contact Text', {}, '.text-content');
    contactText.add('Content', { margin: '0 !important' }, '> p');

    const contactRow = contact.add('Contact Row', {}, 'resume-row');

    contactRow.add('Contact Row Items', {
        'display': 'inline-flex !important',
        'align-items': 'center'
    }, '> .text-content, > .link');

    contactRow.add('Contact Row Separators', {
        'content': '"•"',
        'color': 'var(--accent)',
        'font-size': 'var(--separator-size)',
        'margin': '0 var(--separator-spacing)',
        'opacity': 'var(--separator-opacity)'
    }, '> .text-content + .text-content::before, > .link + .link::before');

    /** Section */
    css.mustFindNode('Section').setProperties({
        'margin-bottom': 'var(--small-spacing)',
        'margin-top': 'var(--small-spacing)'
    }).setProperties({
        'padding-top': '0',
        'padding-bottom': 'var(--x-small-spacing)'
    }, 'Content'
    ).setProperties({
        "font-family": "var(--sans-serif)",
        "font-weight": "700",
        "font-size": "var(--section-title-size)",
        "color": "var(--accent)",
        "border-bottom": "1px solid var(--section-rule-color)",
        "margin-bottom": "calc(var(--small-spacing) - var(--xx-small-spacing))",
        "padding-bottom": "var(--xx-small-spacing)",
        "margin-top": "0"
    }, 'Title');

    /** Entry */
    const entry = css.mustFindNode('Entry').setProperties({
        'display': 'block',
        'margin-bottom': 'var(--small-spacing)',
        'margin-top': '0'
    });

    entry.mustFindNode('Title Block').mustFindNode('Title').setProperty([], 'font-family', 'var(--sans-serif)');

    const titleBlock = css.findNode(["Entry", "Title Block"]);
    if (titleBlock) {
        titleBlock.setProperties({
            "margin-bottom": "var(--xx-small-spacing)",
            "margin-top": "0"
        });

        titleBlock.mustFindNode('Title').setProperties({
            "font-weight": "700",
            "font-size": "var(--entry-title-size)",
            "margin": "0",
            "display": "inline"
        }, 'h3');

        titleBlock.mustFindNode('Subtitle').setProperties({
            "font-size": "var(--entry-subtitle-size)",
            "color": "var(--meta-text-color)",
            "margin": "0",
            "display": "flex",
            "gap": "var(--meta-gap)",
            "margin-top": "var(--entry-subtitle-offset)",
            "font-weight": "500",
            "flex-wrap": "wrap",
            "justify-content": "flex-start"
        });

        titleBlock.add('Subtitle Fields', {
            'display': 'inline-block'
        }, '.field');
    }

    /** Main Column */
    css.add('#main', {
        'padding-left': 'var(--edge-margin)',
        'padding-right': 'var(--edge-margin)',
        'padding-top': '0',
        'padding-bottom': '0'
    });

    return css;
}

export function streamlineRootCss(): CssNode {
    return getRootCss().setProperties((current) => {
        const next = new Map<string, string>(current);
        next.set('--sans-serif', 'Inter, sans-serif');
        next.set('--body-font-size', '11pt');
        next.set('--body-line-height', '1.4');

        next.set('--small-spacing', '0.4em');
        next.set('--x-small-spacing', 'calc(var(--small-spacing) / 2)');
        next.set('--xx-small-spacing', 'calc(var(--small-spacing) / 4)');
        next.set('--edge-margin', '0.4in');

        next.set('--header-title-size', '28pt');
        next.set('--header-subtitle-size', '11.5pt');
        next.set('--header-subtitle-color', '#333333');

        next.set('--contact-font-size', '10pt');
        next.set('--contact-line-height', '1.4');

        next.set('--accent', '#2c3e50');
        next.set('--separator-size', '0.85em');
        next.set('--separator-opacity', '0.7');

        next.set('--section-title-size', '12pt');
        next.set('--section-rule-color', '#d0d0d0');

        next.set('--entry-title-size', '11pt');
        next.set('--entry-subtitle-size', '10pt');
        next.set('--meta-text-color', '#444444');
        next.set('--entry-subtitle-offset', 'calc(var(--xx-small-spacing) / 2)');

        next.set('--spacing', '0.8em');
        next.set('--large-spacing', '1.2em');
        next.set('--x-large-spacing', '1.6em');
        next.set('--xx-large-spacing', '2.4em');

        next.set('--list-indent', 'var(--large-spacing)');
        next.set('--list-item-spacing', 'var(--x-small-spacing)');
        next.set('--list-marker-size', '0.85em');
        next.set('--meta-gap', 'var(--large-spacing)');
        next.set('--separator-spacing', 'var(--spacing)');
        return next;
    });
}

export function streamlineHeader() {
    return {
        "type": "Header",
        "value": "**Dinesh** Chugtai",
        "childNodes": [{
            "type": "Group",
            "htmlId": "contact",
            childNodes: [
                {
                    type: 'Row',
                    justifyContent: 'flex-start',
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
                } as RowProps,
                {
                    type: 'Row',
                    justifyContent: 'flex-start',
                    childNodes: [
                        {
                            type: Link.type,
                            value: "github.com/dineshchugtai",
                            url: "https://github.com/dineshchugtai"
                        } as LinkProps,
                        {
                            type: Link.type,
                            value: "linkedin.com/in/dineshchugtai",
                            url: "https://linkedin.com/in/dineshchugtai"
                        } as LinkProps,
                        {
                            type: Link.type,
                            value: "dineshchugtai.io",
                            url: "https://dineshchugtai.io"
                        } as LinkProps
                    ]
                // TODO: Create a template-facing Link node type (type/value/url) to avoid unknown row casts when childNodes use LinkProps.
                } as unknown as RowProps
            ]
        }],
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
            "type": "Column",
            "htmlId": "main",
            childNodes: [
                experience,
                education,
                skills
            ]
        }
    ];
}
