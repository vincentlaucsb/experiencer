import Section, { SectionHeaderPosition, BasicSectionProps } from "../Section";
import { assignIds } from "../Helpers";
import Header from "../Header";
import Entry, { BasicEntryProps } from "../Entry";
import RichText from "../Paragraph";
import { BasicResumeNode } from "../utility/NodeTree";
import Column from "../Column";
import Row from "../Row";

function randyMarsh(): BasicResumeNode {
    return {
        "type": "Row",
            "children": [
                {
                    "type": "Column",
                    "children": [
                        {
                            "type": "Header",
                            "value": "Randy Marsh",
                            "children": [],
                        },
                        {
                            "type": "Section",
                            "title": "Experience",
                            "children": [
                                {
                                    "type": "Entry",
                                    "title": ["Tegridy Farms", "2019 -- Present"],
                                    "subtitle": ["Founder/CEO", "Somewhere in the boonies"],
                                    "children": [
                                        {
                                            "type": "RichText",
                                            "value": "<ul><li>Pioneered farm-to-door delivery of fresh agricultural produce</li><li>Negotiated a multi-million dollar contract with the Chinese government</li></ul>"
                                        }
                                    ]
                                },
                                {
                                    "type": "Entry",
                                    "title": ["United States Geological Survey", "2010 -- 2019"],
                                    "subtitle": ["Geologist"],
                                } as BasicEntryProps,
                                {
                                    "type": "Entry",
                                    "title": ["Lorde", "2014"],
                                    "subtitle": ["Pop Star"],
                                    "children": [
                                        {
                                            "type": "RichText",
                                            "value": "<ul><li>Released the Billboard #1 hit <em>Push (Feeling Good on A Wednesday)</em></li></ul>",
                                        }
                                    ]
                                }
                            ],
                        } as BasicSectionProps,
                        {
                            "type": "Section",
                            "title": "Education",
                            "children": [
                                {
                                    "type": "Entry",
                                    "title": ["Some College", "1992"],
                                    "subtitle": ["Doctorate in Geology"]
                                } as BasicEntryProps
                            ]
                        } as BasicSectionProps,
                        {
                            "type": "Section",
                            "title": "Awards and Recognition",
                            "children": [
                                {
                                    "type": "Row",
                                    "children": [
                                        {
                                            "type": "Column",
                                            "children": [
                                                {
                                                    "type": "Entry",
                                                    "title": ["Nobel Prize"],
                                                    "subtitle": ["Break Wind Theory"],
                                                    "children": [
                                                        {
                                                            "type": "RichText",
                                                            "value": "<p>Awarded the Nobel Prize for my work on the Break Wind theory of spontaneous combustion</p>"
                                                        }
                                                    ]
                                                } as BasicEntryProps
                                            ]
                                        },
                                        {
                                            "type": "Column",
                                            "children": [
                                                {
                                                    "type": "Entry",
                                                    "title": ["Emmy Award"],
                                                    "subtitle": ["Outstanding Animated Program"],
                                                    "children": [
                                                        {
                                                            "type": "RichText",
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
                    "type": "Column",
                    "children": [
                        {
                            "type": "Section",
                            "title": "Contact",
                            "children": [
                                {
                                    "type": "RichText",
                                    "value": "<p>South Park, CO</p><p>@GettinRandy55</p>"
                                }
                            ]
                        } as BasicSectionProps,
                        {
                            "type": "Section",
                            "title": "Skills",
                            "children": [
                                {
                                    "type": "RichText",
                                    "value": "<ul><li>Advertising</li><li>Agriculture</li><li>Criminal Defense</li><li>Demolition/Explosives</li><li>Geology</li><li>International Commerce</li><li>Magic</li><li>Music Production</li><li>Parade Planning</li><li>Political Activism</li></ul>",
                                }
                            ]
                        },
                        {
                            "type": "Section",
                            "title": "References",
                            "children": [
                                {
                                    "type": "RichText",
                                    "value": "<p><strong>Towelie</strong></p><p>Agricultural Inspector</p><p><br></p>"
                                }
                            ]
                        } as BasicSectionProps,
                        {
                            "type": "RichText",
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
                children: [randyMarsh()],
                css: "#resume * {\n    /* Set all margins to zero, and then re-set them later */\n    margin: 0;\n}\n\n#resume #awards {\n    flex-grow: 0;\n    height: auto;\n}\n\n#resume #awards .column {\n    width: auto;\n    flex-grow: 1;\n    flex-shrink: 1;\n    padding: 0\n}\n\n#resume #awards .column-last {\n    background: none;\n}\n\n#resume .column-last, #resume .column-last h2 {\n    color: #43353f;\n}\n\n#resume #tegridy {\n    margin-top: auto;\n    text-align: right;\n}\n\n/** Sections with Header on Left **/\nsection.header-left h2 {\n    width: 20%;\n    flex-shrink: 0;\n    flex-grow: 0;\n    \n}"
            };

            return data;
        }
    }
}