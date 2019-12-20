import { BasicResumeNode } from "../utility/NodeTree";
import Row, { BasicRowProps } from "../Row";
import Column from "../Column";
import Header, { BasicHeaderProps } from "../Header";
import CssNode from "../utility/CssTree";
import Section, { BasicSectionProps } from "../Section";
import Entry, { BasicEntryProps } from "../Entry";
import RichText from "../RichText";
import getDefaultCss from "./CssTemplates";

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

    let headerCss = randyCss.findNode(["Header"]) as CssNode;
    if (headerCss) {
        headerCss.properties = new Map<string, string>([
            ["height", "100px"],
            ["font-family", "Merriweather, serif"],
            ["text-transform", "uppercase"],
            ["color", "#43353f"]
        ]);

        headerCss.setProperties(["Subtitle"], [
            ["font-size", "13pt"],
            ["text-transform", "initial"]
        ]);
    }

    let sectionCss = randyCss.findNode(['Section']) as CssNode;
    if (sectionCss) {
        sectionCss.setProperties(['Contents'], [
            ['margin-top', '8px']
        ]);

        sectionCss.setProperties(
            ['Title'],
            [
                ["font-family", "Open Sans, sans-serif"],
                ["font-weight", "bold"],
                ["font-size", "20pt"],
                ["color", "#4eb3b9"]
            ]
        );
    }

    let entryCss = randyCss.findNode(["Entry"]) as CssNode;
    if (entryCss) {
        let titleCss = entryCss.findNode(["Title Block", "Title"]) as CssNode;
        if (titleCss) {
            titleCss.setProperties(["First Title Field"], [
                ["font-weight", "bold"],
                ["font-family", "Merriweather, serif"]
            ]);

            titleCss.setProperties(["Other Title Fields"], [
                ["font-weight", "normal"]
            ]);
        }
    }

    let mainRowCss = randyCss.add(
        (randyCss.findNode(["Row"]) as CssNode).copySkeleton('#main', '#main'));
    mainRowCss.properties = new Map<string, string>([
        ["height", "100%"],
        ["flex-grow", "2"]
    ]);

    let mainColCss = randyCss.add(
        (randyCss.findNode(["Row", "Column"]) as CssNode).copySkeleton('#main-column', '#main-column'));
    mainColCss.properties = new Map<string, string>([
        ["padding", "0.5in"]]);

    let sidebarCss = randyCss.add(
        (randyCss.findNode(["Row", "Column"]) as CssNode).copySkeleton('#sidebar', '#sidebar'));
    sidebarCss.properties = new Map<string, string>([
        ["color", "#43353f"],
        ["padding", "0.5in"],
        ["background", "#fbdcb6"],
        ["padding-top", "calc(100px + 0.5in)"],
        ["width", "150px"]]);

    let tegridyCss = randyCss.add(
        (randyCss.findNode(["Rich Text"]) as CssNode).copySkeleton('#tegridy', '#tegridy'));
    tegridyCss.properties = new Map<string, string>([
        ["margin-top", "auto"],
        ["text-align", "right"]]);

    return randyCss;
}

export function randyMarsh(): BasicResumeNode {
    return {
        "type": Row.type,
        "htmlId": "main",
        "children": [
            {
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
                        "children": [
                            {
                                "type": Entry.type,
                                "title": ["Tegridy Farms", "2019 -- Present"],
                                "subtitle": ["Founder/CEO", "Somewhere in the boonies"],
                                "children": [
                                    {
                                        "type": RichText.type,
                                        "value": "<ul><li>Pioneered farm-to-door delivery of fresh agricultural produce</li><li>Negotiated a multi-million dollar contract with the Chinese government</li></ul>"
                                    }
                                ]
                            },
                            {
                                "type": Entry.type,
                                "title": ["United States Geological Survey", "2010 -- 2019"],
                                "subtitle": ["Geologist"],
                            } as BasicEntryProps,
                            {
                                "type": Entry.type,
                                "title": ["Lorde", "2014"],
                                "subtitle": ["Pop Star"],
                                "children": [
                                    {
                                        "type": RichText.type,
                                        "value": "<ul><li>Released the Billboard #1 hit <em>Push (Feeling Good on A Wednesday)</em></li></ul>",
                                    }
                                ]
                            }
                        ],
                    } as BasicSectionProps,
                    {
                        "type": Section.type,
                        "title": "Education",
                        "children": [
                            {
                                "type": Entry.type,
                                "title": ["Some College", "1992"],
                                "subtitle": ["Doctorate in Geology"]
                            } as BasicEntryProps
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
            },
            {
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
            }
        ]
    }
}
