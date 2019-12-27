import { BasicResumeNode } from "../utility/NodeTree";
import { BasicHeaderProps } from "../Header";
import { BasicEntryProps } from "../Entry";
import { makeList } from "./TemplateHelper";
import { BasicIconProps } from "../Icon";
import getDefaultCss from "./CssTemplates";
import CssNode from "../utility/CssTree";

export function assuredCss() {
    let defaultCss = getDefaultCss();
    let rootCss = defaultCss.cssRoot as CssNode;
    if (rootCss) {
        rootCss.properties.set('--accent', '#315eaa');
    }

    defaultCss.properties = new Map<string, string>([
        ["font-family", "var(--sans-serif)"],
        ["font-size", "11pt"]
    ]);

    const header = defaultCss.findNode("Header");
    if (header) {
        header.properties = new Map<string, string>([
            ["background", "#eeeeee"],
            ["margin-bottom", "var(--large-spacing)"],
            ["padding", "var(--edge-margin)"],
            ["padding-bottom", "var(--large-spacing)"],
        ]);

        header.add('Rich Text', {
            'text-align': 'right',
            'font-size': '10pt'
        }, '.rich-text');

        header.add('Icon', {
            'height': '24px',
            'vertical-align': 'middle'
        }, 'svg.icon, img.icon');
    }

    let contactLeft = new CssNode(
        "#contact-left",
        {
            "grid-template-columns": "1fr 30px",
            "grid-column-gap": "var(--small-spacing)",
            "width": "auto",
            "height": "auto",
            "margin-left": "auto"
        },
        "#contact-left");

    let contactRight = new CssNode(
        '#contact-right',
        {
            "grid-template-columns": "1fr 30px",
            "grid-column-gap": "var(--spacing)",
            "width": "auto",
            "height": "auto"
        },
        '#contact-right');

    defaultCss.addNode(contactLeft);
    defaultCss.addNode(contactRight);
    defaultCss.setProperties(["Section", "Title"], [
        ["font-family", "var(--serif)"],
        ["font-weight", "bold"],
        ["font-size", "18pt"],
        ["color", "var(--accent)"]
    ]);

    defaultCss.setProperties(["Section", "Content"],
        new Map<string, string>()
    );
    
    defaultCss.add('#main', {
        'padding-left': 'var(--edge-margin)',
        'padding-right': 'var(--edge-margin)',
        'grid-template-columns': '1fr 180px',
        'grid-column-gap': 'var(--large-spacing)'
    });

    const sidebar = defaultCss.add('#sidebar', {});
    sidebar.add('Last Subtitle Field', {
        'margin-left': '0'
    }, 'div.entry > hgroup > h4 span.field-last');

    const subtitleFields = defaultCss.findNode(["Entry", "Title Block", "Subtitle"]) as CssNode;
    let middleFields = subtitleFields.findNode(["Middle Fields"]) as CssNode;
    middleFields.add(":before", {
        content: '"|"',
        padding: "0.5em"
    });

    subtitleFields.setProperties("Last Field", [
        ["margin-left", "auto"],
        ["text-align", "right"]
    ]);

    return defaultCss;
}

export function assuredNodes(): Array<BasicResumeNode> {
    let contactLeft = {
        "type": "Grid",
        "htmlId": "contact-left",
        "children": [
            {
                type: "Rich Text",
                value: "(123) 456-7890"
            },
            {
                type: "Icon",
                icon: "phone"
            } as BasicIconProps,
            {
                type: "Rich Text",
                value: "mynameis@mail.com"
            },
            {
                type: "Icon",
                icon: "email"
            } as BasicIconProps,
            {
                type: "Rich Text",
                value: "Sometown, USA"
            },
            {
                type: "Icon",
                icon: "map-pin"
            } as BasicIconProps
        ]
    }

    let contactRight = {
        "type": "Grid",
        "htmlId": "contact-right",
        "children": [
            {
                type: "Rich Text",
                value: "My GitHub"
            },
            {
                type: "Icon",
                icon: "github"
            } as BasicIconProps,
            {
                type: "Rich Text",
                value: "mylinkedin"
            },
            {
                type: "Icon",
                icon: "linkedin"
            } as BasicIconProps,
            {
                type: "Rich Text",
                value: "mywebsite.com"
            },
            {
                type: "Icon",
                icon: "globe"
            } as BasicIconProps
        ]
    }

    let header = {
        "type": "Header",
        "value": "<p>Solid <strong>Programmer</strong></p>",
        "children": [
            contactLeft,
            contactRight
        ],
        "subtitle": "<p>Software Engineer</p>",
        "justifyContent": "flex-end",
        "distribution": "left-to-right"
    } as BasicHeaderProps;

    let experience = {
        "type": "Section",
        "value": "Experience",
        "children": [
            {
                "type": "Entry",
                "title": ["Some Startup"],
                "subtitle": ["Software Engineer", "San Francisco, CA", "September 2016 -- Present"],
                "children": [
                    makeList([
                        'Did things while looking at a computer monitor'
                    ])
                ]
            } as BasicEntryProps
        ]
    } as BasicResumeNode;

    let projects = {
        "type": "Section",
        "children": [
            {
                "type": "Entry",
                "title": ["Roomba Ruler"],
                "children": [
                    makeList([
                        'Created an app which allows you to control a swarm of room-cleaning robots'
                    ])
                ]
            }
        ],
        "value": "Projects"
    };

    let education = {
        "type": "Section",
        "value": "Education",
        "children": [
            {
                "type": "Entry",
                "title": ["Some College"],
                "subtitle": ["BA Mathematics", "2018", "3.99 GPA"],
                "subtitleBreaks": [1],
                "children": []
            } as BasicEntryProps
        ]
    };

    let data = [
        header,
        {
            "type": "Grid",
            "htmlId": "main",
            "children": [
                {
                    "type": "Column",
                    "children": [
                        experience,
                        projects
                    ]
                },
                {
                    "type": "Column",
                    "children": [
                        education,
                        {
                            "type": "Section",
                            "value": "Languages",
                            "children": [makeList([
                                "COBOL",
                                "Pascal"
                            ])]
                        }
                    ],
                    "htmlId": "sidebar"
                }
            ]
        }
    ]

    return data;
}