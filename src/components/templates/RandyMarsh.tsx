import { BasicResumeNode } from "../utility/NodeTree";
import Row, { BasicRowProps } from "../Row";
import Column from "../Column";
import Header, { BasicHeaderProps } from "../Header";
import CssNode from "../utility/CssTree";
import Section, { BasicSectionProps } from "../Section";
import Entry, { BasicEntryProps } from "../Entry";
import RichText from "../RichText";
import getDefaultCss from "./CssTemplates";
import Grid from "../Grid";

export function randyMarshCss() {
    let randyCss = getDefaultCss();
    randyCss.properties = new Map<string, string>([
        ["font-family", "Open Sans, sans-serif"],
        ["font-size", "11pt"],
        ["padding", "0"],
        ["display", "flex"],
        ["flex-direction", "column"],
        ["height", "100%"]
    ]);

    let rootCss = randyCss.root as CssNode;
    if (rootCss) {
        rootCss.properties.set('--year-column-width', '100px');
        rootCss.properties.set('--text-color', '#43353f');
        rootCss.properties.set('--randy-teal', '#4eb3b9');
        rootCss.properties.set('--secondary-color', '#fbdcb6');
    }

    let headerCss = randyCss.findNode(["Header"]) as CssNode;
    if (headerCss) {
        headerCss.properties = new Map<string, string>([
            ["height", "100px"],
            ["font-family", "var(--serif)"],
            ["text-transform", "uppercase"],
            ["color", "var(--text-color)"]
        ]);

        headerCss.setProperties(["Title Group", "Subtitle"], [
            ["font-size", "13pt"],
            ["text-transform", "initial"]
        ]);
    }

    let sectionCss = randyCss.findNode(['Section']) as CssNode;
    if (sectionCss) {
        sectionCss.setProperties(['Content'], [
            ['margin-top', 'var(--spacing)']
        ]);

        sectionCss.setProperties(
            ['Title'],
            [
                ["font-family", "var(--sans-serif)"],
                ["font-weight", "bold"],
                ["font-size", "20pt"],
                ["color", "var(--randy-teal)"]
            ]
        );
    }

    sectionCss.add(new CssNode('Grid', {
        'grid-template-columns': 'var(--year-column-width) 1fr'
    }, 'div.grid-container'))

    let entryCss = randyCss.findNode(["Entry"]) as CssNode;
    entryCss.properties = new Map<string, string>([
        ['border-left', '1px solid var(--text-color)'],
        ['padding-left', 'var(--large-spacing)'],
        ['padding-bottom', 'var(--large-spacing)']
    ]);

    if (entryCss) {
        let titleCss = entryCss.findNode(["Title Block", "Title"]) as CssNode;
        if (titleCss) {
            titleCss.setProperties(["First Title Field"], [
                ["font-weight", "bold"],
                ["font-family", "var(--serif)"]
            ]);

            titleCss.setProperties(["Other Title Fields"], [
                ["font-weight", "normal"]
            ]);
        }
    }

    let mainRowCss = randyCss.add(
        (randyCss.findNode(["Row"]) as CssNode).copySkeleton('#main', '#main'));
    mainRowCss.properties = new Map<string, string>([
        ["grid-template-columns", "250px 1fr"],
        ["height", "100%"],
    ]);

    let mainColCss = randyCss.add(
        (randyCss.findNode(["Row", "Column"]) as CssNode).copySkeleton('#main-column', '#main-column'));
    mainColCss.properties = new Map<string, string>([
        ["padding", "0.5in"]]);

    let sidebarCss = randyCss.add(
        (randyCss.findNode(["Row", "Column"]) as CssNode).copySkeleton('#sidebar', '#sidebar'));
    sidebarCss.properties = new Map<string, string>([
        ["color", "var(--text-color)"],
        ["padding", "0.5in"],
        ["background", "var(--secondary-color)"],
        ["padding-top", "calc(100px + 0.5in)"]
    ]);

    let tegridyCss = randyCss.add(
        (randyCss.findNode(["Rich Text"]) as CssNode).copySkeleton('#tegridy', '#tegridy'));
    tegridyCss.properties = new Map<string, string>([
        ["margin-top", "auto"],
        ["text-align", "right"]]);

    return randyCss;
}

export function randyMarsh(): BasicResumeNode {
    let experience = [
        {
            type: Grid.type,
            children: [
                {
                    type: RichText.type,
                    value: "2019 -- Present"
                },
                {
                    "type": Entry.type,
                    "title": ["Tegridy Farms"],
                    "subtitle": ["Founder/CEO", "Somewhere in the boonies"],
                    "children": [
                        {
                            "type": RichText.type,
                            "value": "<ul><li>Pioneered farm-to-door delivery of fresh agricultural produce</li><li>Negotiated a multi-million dollar contract with the Chinese government</li></ul>"
                        }
                    ]
                },
                {
                    type: RichText.type,
                    value: "2010 -- 2019"
                },
                {
                    "type": Entry.type,
                    "title": ["United States Geological Survey"],
                    "subtitle": ["Geologist"],
                } as BasicEntryProps,
                {
                    type: RichText.type,
                    value: "2014"
                },
                {
                    "type": Entry.type,
                    "title": ["Lorde"],
                    "subtitle": ["Pop Star"],
                    "children": [
                        {
                            "type": RichText.type,
                            "value": "<ul><li>Released the Billboard #1 hit <em>Push (Feeling Good on A Wednesday)</em></li></ul>",
                        }
                    ]
                }
            ]
        }
    ];

    let sideColumn = {
        "type": Column.type,
        "htmlId": "sidebar",
        "children": [
            {
                "type": Section.type,
                "title": "Contact",
                "children": [
                    {
                        "type": RichText.type,
                        "value": "<p>South Park, CO</p><p>@GettinRandy55</p>"
                    }
                ]
            } as BasicSectionProps,
            {
                "type": Section.type,
                "title": "Skills",
                "children": [
                    {
                        "type": RichText.type,
                        "value": "<ul><li>Advertising</li><li>Agriculture</li><li>Criminal Defense</li><li>Demolition/Explosives</li><li>Geology</li><li>International Commerce</li><li>Magic</li><li>Music Production</li><li>Parade Planning</li><li>Political Activism</li></ul>",
                    }
                ]
            },
            {
                "type": Section.type,
                "title": "References",
                "children": [
                    {
                        "type": RichText.type,
                        "value": "<p><strong>Towelie</strong></p><p>Agricultural Inspector</p><p><br></p>"
                    }
                ]
            } as BasicSectionProps,
            {
                "type": RichText.type,
                "value": "<p>Typeset entirely with HTML, CSS, and good old-fashioned<strong> TEGRIDY</strong></p>",
                "htmlId": "tegridy"
            }
        ]
    };

    let mainColumn = {
        "type": Column.type,
        "htmlId": "main-column",
        "children": [
            {
                "type": Header.type,
                "value": "Randy Marsh",
                "subtitle": "Geologist and Innovator",
                "children": [],
            } as BasicHeaderProps,
            {
                "type": Section.type,
                "title": "Experience",
                "htmlId": "experience",
                "children": experience,
            } as BasicSectionProps,
            {
                "type": Section.type,
                "title": "Education",
                "children": [
                    {
                        type: Grid.type,
                        children: [
                            {
                                type: RichText.type,
                                value: "1992"
                            },
                            {
                                "type": Entry.type,
                                "title": ["Some College"],
                                "subtitle": ["Doctorate in Geology"]
                            } as BasicEntryProps
                        ]
                    }
                ]
            } as BasicSectionProps,
            {
                "type": Section.type,
                "title": "Awards and Recognition",
                "children": [
                    {
                        "type": Row.type,
                        "evenColumns": true,
                        "children": [
                            {
                                "type": Column.type,
                                "children": [
                                    {
                                        "type": Entry.type,
                                        "title": ["Nobel Prize"],
                                        "subtitle": ["Break Wind Theory"],
                                        "children": [
                                            {
                                                "type": RichText.type,
                                                "value": "<p>Awarded the Nobel Prize for my work on the Break Wind theory of spontaneous combustion</p>"
                                            }
                                        ]
                                    } as BasicEntryProps
                                ]
                            },
                            {
                                "type": Column.type,
                                "children": [
                                    {
                                        "type": Entry.type,
                                        "title": ["Emmy Award"],
                                        "subtitle": ["Outstanding Animated Program"],
                                        "children": [
                                            {
                                                "type": RichText.type,
                                                "value": "<p>Gifted an Emmy Award after passing a stool weighing well over 100 courics</p>"
                                            }
                                        ]
                                    }
                                ]
                            }
                        ],
                        "htmlId": "awards"
                    } as BasicRowProps
                ]
            } as BasicSectionProps
        ]
    };

    return {
        "type": Grid.type,
        "htmlId": "main",
        "children": [
            sideColumn,
            mainColumn,
        ]
    }
}
