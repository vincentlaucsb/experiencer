import { BasicResumeNode } from "../utility/NodeTree";
import { BasicHeaderProps } from "../Header";
import { BasicEntryProps } from "../Entry";
import { BasicSectionProps } from "../Section";
import { makeList } from "./TemplateHelper";
import { BasicIconProps } from "../Icon";

export function assuredCss() {
    let contactLeft = {
        "children": [],
        "name": "#contact-left",
        "selector": "#contact-left",
        "properties": [
            ["grid-template-columns", "1fr 30px"],
            ["grid-column-gap", "4px"],
            ["width", "auto"],
            ["height", "auto"],
            ["margin-left", "auto"]
        ]
    };

    let contactRight = {
        "children": [],
        "name": "#contact-right",
        "selector": "#contact-right",
        "properties": [
            ["grid-template-columns", "1fr 30px"],
            ["grid-column-gap", "4px"],
            ["width", "auto"],
            ["height", "auto"]
        ]
    };

    return {
        "children": [
            contactLeft,
            contactRight,
            {
                "children": [],
                "name": "Links",
                "selector": "a, a:hover",
                "properties": [["color", "#000000"]]
            },
            {
                "children": [
                    {
                        "children": [],
                        "name": "Subtitle",
                        "selector": "h2.subtitle",
                        "properties": [["font-weight", "normal"]]
                    }
                ],
                "name": "Header",
                "selector": "header",
                "properties": [
                    ["margin-bottom", "16px"],
                    ["background", "#eeeeee"],
                    ["padding", "0.5in"],
                    ["padding-bottom", "16px"],
                    ["font-family", "Open Sans, sans-serif"]
                ]
            },
            {
                "children": [
                    {
                        "children": [],
                        "name": "Definitions",
                        "selector": "dd",
                        "properties": [["padding-left", "0.5rem"]]
                    }
                ],
                "name": "Description List",
                "selector": "dl",
                "properties": []
            },
            {
                "children": [],
                "name": "Grid",
                "selector": "div.grid-container",
                "properties": []
            },
            {
                "children": [
                    {
                        "children": [],
                        "name": "Title",
                        "selector": "h2",
                        "properties": [
                            ["font-family", "Merriweather, serif"],
                            ["font-weight", "bold"],
                            ["font-size", "18pt"],
                            ["color", "#315eaa"]
                        ]
                    },
                    {
                        "children": [],
                        "name": "Contents",
                        "selector": ".entry-content",
                        "properties": []
                    }
                ],
                "name": "Section",
                "selector": "section",
                "properties": []
            },
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [
                                    {
                                        "children": [],
                                        "name": "First Title Field",
                                        "selector": ".field-0",
                                        "properties": [["font-weight", "bold"]]
                                    },
                                    {
                                        "children": [],
                                        "name": "Other Title Fields",
                                        "selector": ":not(.field-0)",
                                        "properties": [["font-weight", "normal"]]
                                    },
                                    {
                                        "children": [],
                                        "name": "First Title Field (After)",
                                        "selector": ".field-0::after",
                                        "properties": []
                                    }
                                ],
                                "name": "Title",
                                "selector": "h3.title",
                                "properties": [
                                    ["font-size", "13pt"],
                                    ["font-family", "Merriweather, serif"],
                                    ["display", "flex"]
                                ]
                            },
                            {
                                "children": [
                                    {
                                        "children": [],
                                        "name": "Other Subtitle Fields",
                                        "selector": ".field:not(.field-0)",
                                        "properties": []
                                    }
                                ],
                                "name": "Subtitle",
                                "selector": "h4.subtitle",
                                "properties": [
                                    ["font-family", "Open Sans, sans-serif"],
                                    ["display", "flex"],
                                    ["justify-content", "flex-start"]
                                ]
                            }
                        ],
                        "name": "Title Block",
                        "selector": "hgroup",
                        "properties": [["margin-bottom", "4px"]]
                    }
                ],
                "name": "Entry",
                "selector": ".entry",
                "properties": [["margin-bottom", "16px"]]
            },
            {
                "children": [
                    {
                        "children": [
                            {
                                "children": [],
                                "name": "List Item",
                                "selector": "li",
                                "properties": [["list-style-type", "square"]]
                            }
                        ],
                        "name": "Lists",
                        "selector": "ul",
                        "properties": [["padding-left", "1.5em"]]
                    }
                ],
                "name": "Rich Text",
                "selector": ".rich-text",
                "properties": []
            },
            {
                "children": [
                    {
                        "children": [],
                        "name": "Column",
                        "selector": ".column",
                        "properties": []
                    },
                    {
                        "children": [],
                        "name": "First Column",
                        "selector": ".column-0",
                        "properties": []
                    },
                    {
                        "children": [],
                        "name": "All Columns Except First",
                        "selector": ".column:not(.column-0)",
                        "properties": [["margin-left", "1em"]]
                    },
                    {
                        "children": [],
                        "name": "Last Column",
                        "selector": ".column-last",
                        "properties": []
                    }
                ],
                "name": "Row",
                "selector": ".row",
                "properties": []
            },
            {
                "children": [
                    {
                        "children": [],
                        "name": "Column",
                        "selector": ".column",
                        "properties": []
                    },
                    {
                        "children": [],
                        "name": "First Column",
                        "selector": ".column-0",
                        "properties": []
                    },
                    {
                        "children": [],
                        "name": "All Columns Except First",
                        "selector": ".column:not(.column-0)",
                        "properties": []
                    },
                    {
                        "children": [],
                        "name": "Last Column",
                        "selector": ".column-last",
                        "properties": []
                    }
                ],
                "name": "#main",
                "selector": "#main",
                "properties": [
                    ["grid-template-columns", "1fr 200px"],
                    ["grid-column-gap", "24px"],
                    ["margin-left", "0.5in"],
                    ["margin-right", "0.5in"]
                ]
            },
            {
                "children": [],
                "name": "#sidebar",
                "selector": "#sidebar",
                "properties": []
            }
        ],
            "name": "Resume CSS",
                "selector": "#resume",
                    "properties": [
                        ["font-family", "Open Sans, sans-serif"],
                        ["font-size", "11pt"]
                    ]
    }
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
        "title": "Experience",
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
    } as BasicSectionProps;

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
        "title": "Projects"
    };

    let education = {
        "type": "Section",
        "title": "Education",
        "children": [
            {
                "type": "Entry",
                "title": ["Some College"],
                "subtitle": ["BA Mathematics", "2018", "3.99 GPA"],
                "children": []
            }
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
                            "title": "Languages",
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