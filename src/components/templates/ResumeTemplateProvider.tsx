import Section, { SectionHeaderPosition, BasicSectionProps } from "../Section";
import { assignIds } from "../Helpers";
import Header from "../Header";
import Entry, { BasicEntryProps } from "../Entry";
import RichText from "../Paragraph";
import { BasicResumeNode } from "../utility/NodeTree";
import Column from "../Column";
import Row from "../Row";
import CssNode from "../utility/CssTree";

function randyMarshCss() {
    return CssNode.load({
        "children": [
            {
                "children": [],
                "name": "Links",
                "selector": "a, a:hover",
                "properties": [["color", "#000000"]]
            },
            {
                "children": [],
                "name": "Header",
                "selector": "header",
                "properties": [
                    ["height", "100px"],
                    ["font-family", "Merriweather, serif"],
                    ["text-transform", "uppercase"],
                    ["color", "#43353f"]
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
                "name": "Description Lists",
                "selector": "dl",
                "properties": []
            },
            {
                "children": [
                    {
                        "children": [],
                        "name": "Title",
                        "selector": "h2",
                        "properties": [
                            ["font-family", "Open Sans, sans-serif"],
                            ["font-weight", "bold"],
                            ["font-size", "20pt"],
                            ["color", "#4eb3b9"]
                        ]
                    },
                    {
                        "children": [],
                        "name": "Contents",
                        "selector": ".entry-content",
                        "properties": [["margin-top", "8px"]]
                    }
                ],
                "name": "Section",
                "selector": "section",
                "properties": [["margin-bottom", "16px"]]
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
                                        "properties": [
                                            ["font-weight", "bold"],
                                            ["font-family", "Merriweather, serif"]
                                        ]
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
                                        "properties": [
                                            ["content", "','"],
                                            ["padding-right", "0.33em"]
                                        ]
                                    }
                                ],
                                "name": "Title",
                                "selector": "h3.title",
                                "properties": [["font-size", "15pt"]]
                            },
                            {
                                "children": [
                                    {
                                        "children": [],
                                        "name": "Other Subtitle Fields",
                                        "selector": ".field:not(.field-0)",
                                        "properties": [["margin-left", "1em"]]
                                    }
                                ],
                                "name": "Subtitle",
                                "selector": ".subtitle",
                                "properties": [["font-family", "Verdana, sans-serif"]]
                            }
                        ],
                        "name": "Title Block",
                        "selector": ".entry-title",
                        "properties": [["margin-bottom", "4px"]]
                    }
                ],
                "name": "Entry",
                "selector": ".entry",
                "properties": [["margin-bottom", "15px"]]
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
                        "name": "All Columns",
                        "selector": ".column",
                        "properties": [["padding", "0.5in"]]
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
                        "properties": [
                            ["background", "#fbdcb6"],
                            ["padding-top", "calc(100px + 0.5in)"],
                            ["width", "150px"]
                        ]
                    }
                ],
                "name": "Row",
                "selector": ".row",
                "properties": [
                    ["height", "100%"],
                    ["flex-grow", "2"]
                ]
            }
        ],
        "name": "Resume CSS",
        "selector": "#resume",
        "properties": [
            ["font-family", "Open Sans, sans-serif"],
            ["font-size", "11pt"],
            ["padding", "0"],
            ["flex-direction", "column"],
            ["display", "flex"],
            ["height", "100%"]
        ]
    });
}

function randyMarsh(): BasicResumeNode {
    return {
        "type": Row.name,
            "children": [
                {
                    "type": Column.name,
                    "children": [
                        {
                            "type": Header.name,
                            "value": "Randy Marsh",
                            "children": [],
                        },
                        {
                            "type": Section.name,
                            "title": "Experience",
                            "children": [
                                {
                                    "type": Entry.name,
                                    "title": ["Tegridy Farms", "2019 -- Present"],
                                    "subtitle": ["Founder/CEO", "Somewhere in the boonies"],
                                    "children": [
                                        {
                                            "type": RichText.name,
                                            "value": "<ul><li>Pioneered farm-to-door delivery of fresh agricultural produce</li><li>Negotiated a multi-million dollar contract with the Chinese government</li></ul>"
                                        }
                                    ]
                                },
                                {
                                    "type": Entry.name,
                                    "title": ["United States Geological Survey", "2010 -- 2019"],
                                    "subtitle": ["Geologist"],
                                } as BasicEntryProps,
                                {
                                    "type": Entry.name,
                                    "title": ["Lorde", "2014"],
                                    "subtitle": ["Pop Star"],
                                    "children": [
                                        {
                                            "type": RichText.name,
                                            "value": "<ul><li>Released the Billboard #1 hit <em>Push (Feeling Good on A Wednesday)</em></li></ul>",
                                        }
                                    ]
                                }
                            ],
                        } as BasicSectionProps,
                        {
                            "type": Section.name,
                            "title": "Education",
                            "children": [
                                {
                                    "type": Entry.name,
                                    "title": ["Some College", "1992"],
                                    "subtitle": ["Doctorate in Geology"]
                                } as BasicEntryProps
                            ]
                        } as BasicSectionProps,
                        {
                            "type": Section.name,
                            "title": "Awards and Recognition",
                            "children": [
                                {
                                    "type": Row.name,
                                    "children": [
                                        {
                                            "type": Column.name,
                                            "children": [
                                                {
                                                    "type": Entry.name,
                                                    "title": ["Nobel Prize"],
                                                    "subtitle": ["Break Wind Theory"],
                                                    "children": [
                                                        {
                                                            "type": RichText.name,
                                                            "value": "<p>Awarded the Nobel Prize for my work on the Break Wind theory of spontaneous combustion</p>"
                                                        }
                                                    ]
                                                } as BasicEntryProps
                                            ]
                                        },
                                        {
                                            "type": Column.name,
                                            "children": [
                                                {
                                                    "type": Entry.name,
                                                    "title": ["Emmy Award"],
                                                    "subtitle": ["Outstanding Animated Program"],
                                                    "children": [
                                                        {
                                                            "type": RichText.name,
                                                            "value": "<p>Gifted an Emmy Award after passing a stool weighing well over 100 courics</p>"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    "cssId": "awards"
                                }
                            ]
                        } as BasicSectionProps
                    ]
                },
                {
                    "type": Column.name,
                    "children": [
                        {
                            "type": Section.name,
                            "title": "Contact",
                            "children": [
                                {
                                    "type": RichText.name,
                                    "value": "<p>South Park, CO</p><p>@GettinRandy55</p>"
                                }
                            ]
                        } as BasicSectionProps,
                        {
                            "type": Section.name,
                            "title": "Skills",
                            "children": [
                                {
                                    "type": RichText.name,
                                    "value": "<ul><li>Advertising</li><li>Agriculture</li><li>Criminal Defense</li><li>Demolition/Explosives</li><li>Geology</li><li>International Commerce</li><li>Magic</li><li>Music Production</li><li>Parade Planning</li><li>Political Activism</li></ul>",
                                }
                            ]
                        },
                        {
                            "type": Section.name,
                            "title": "References",
                            "children": [
                                {
                                    "type": RichText.name,
                                    "value": "<p><strong>Towelie</strong></p><p>Agricultural Inspector</p><p><br></p>"
                                }
                            ]
                        } as BasicSectionProps,
                        {
                            "type": RichText.name,
                            "value": "<p>Typeset entirely with HTML, CSS, and good old-fashioned<strong> TEGRIDY</strong></p>",
                            "cssId": "tegridy"
                        }
                    ]
                }
            ]
    }
}

export default class ResumeTemplateProvider {
    static defaultCss = `#resume * {
    /* Set all margins to zero, and then re-set them later */
    margin: 0;
}

/** Sections with Header on Left **/
section.header-left h2 {
    width: 20%;
    flex-shrink: 0;
    flex-grow: 0;
}`;

    static get header() {
        return {
            type: Header.name,
            value: 'Your Name Here',
            children: [
                {
                    type: RichText.name,
                    value: '<p>Email: spamMePlz@spicymail.com</p><p>Phone: 123-456-7890</p>'
                }
            ]
        };
    }

    static get objective() {
        return {
            type: Section.name,
            title: 'Objective',
            children: [
                {
                    type: RichText.name,
                    value: 'To conquer the world.'
                }
            ]
        } as BasicSectionProps;
    }

    static get experience() {
        return {
            type: Section.name,
            title: 'Experience',
            children: [
                {
                    type: Entry.name,
                    title: ['Another Company', '2019 -- Present'],
                    subtitle: ['Senior Software Engineer', 'Sometown, USA'],
                    children: [
                        this.makeList([
                            'Increased productivity by conducting telepathic SCRUM meetings'
                        ])
                    ]
                } as BasicEntryProps,
                {
                    type: Entry.name,
                    title: [ 'Some Company', '2014 -- 2016'],
                    subtitle: ['Software Engineer', 'Big City, USA'],
                    children: [
                        this.makeList([
                            'Did things with code while looking at a computer monitor'
                        ])
                    ]
                } as BasicEntryProps
            ]
        } as BasicSectionProps
    };

    static get techSkills() {
        return {
            type: Section.name,
            title: 'Technical Skills',
            children: [
                this.makeList([ 'C++', 'Web Development', 'Agile/SCRUM' ])
            ]
        } as BasicSectionProps
    };

    static get education() {
        return {
            type: Section.name,
            title: 'Education',
            children: [
                {
                    type: Entry.name,
                    title: ['Some College', '2010 -- 2014'],
                    subtitle: ['BS in Some Major']
                } as BasicEntryProps
            ]
        } as BasicSectionProps;
    }

    /**
     * Construct a bulleted list
     * @param items A list of items
     */
    static makeList(items: Array<string>): BasicResumeNode {
        let value = "";
        items.forEach((i) => {
            value += `<li>${i}</li>`
        });

        return {
            type: RichText.name,
            value: `<ul>${value}</ul>`
        };
    }

    static templates = {
        "Traditional 1": () => {
            let header = ResumeTemplateProvider.header;
            header.children[0]['disableLineBreaks'] = true;

            let data = {
                children: assignIds([
                    header,
                    ResumeTemplateProvider.objective,
                    ResumeTemplateProvider.experience,
                    ResumeTemplateProvider.techSkills,
                    ResumeTemplateProvider.education
                ]),
                css: ResumeTemplateProvider.defaultCss,
                sectionTitlePosition: "top" as SectionHeaderPosition
            };

            for (let k in data.children) {
                const node = data.children[k];
                if (node['type'] === 'Section') {
                    node['headerPosition'] = 'top';
                }
            }

            return data;
        },

        "Traditional 2": () => {
            let header = ResumeTemplateProvider.header;
            header.children[0]['disableLineBreaks'] = true;

            let data = {
                children: assignIds([
                    header,
                    ResumeTemplateProvider.objective,
                    ResumeTemplateProvider.experience,
                    ResumeTemplateProvider.techSkills,
                    ResumeTemplateProvider.education
                ]),
                css: ResumeTemplateProvider.defaultCss,
                sectionTitlePosition: "left" as SectionHeaderPosition
            };

            data.children.forEach((node) => {
                if (node['type'] === 'Section') {
                    node['headerPosition'] = 'left';
            }});
            
            return data;
        },

        "Multi-Column 1": () => {
            let header = ResumeTemplateProvider.header;
            header['orientation'] = 'row';

            let data = {
                children: assignIds([
                    header,
                    ResumeTemplateProvider.objective,
                    {
                        type: Row.name,
                        children: [
                            {
                                type: Column.name,
                                children: [
                                    ResumeTemplateProvider.education,
                                    ResumeTemplateProvider.techSkills
                                ]
                            },
                            {
                                type: Column.name,
                                children: [
                                    ResumeTemplateProvider.experience
                                ]
                            }
                        ]
                    }
                ]),
                css: ResumeTemplateProvider.defaultCss,
            };

            return data;
        },

        "Randy Marsh": () => {
            let data = {
                builtinCss: randyMarshCss(),
                children: [randyMarsh()],
                css: "#resume * {\n    /* Set all margins to zero, and then re-set them later */\n    margin: 0;\n}\n\n#resume #awards {\n    flex-grow: 0;\n    height: auto;\n}\n\n#resume #awards .column {\n    width: auto;\n    flex-grow: 1;\n    flex-shrink: 1;\n    padding: 0\n}\n\n#resume #awards .column-last {\n    background: none;\n}\n\n#resume .column-last, #resume .column-last h2 {\n    color: #43353f;\n}\n\n#resume #tegridy {\n    margin-top: auto;\n    text-align: right;\n}\n\n/** Sections with Header on Left **/\nsection.header-left h2 {\n    width: 20%;\n    flex-shrink: 0;\n    flex-grow: 0;\n    \n}"
            };

            return data;
        }
    }
}