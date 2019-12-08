import { SectionHeaderPosition } from "./Section";
import uuid from 'uuid/v4';
import { assignIds } from "./Helpers";
import Resume from "src/Resume";

export default class ResumeTemplateProvider {
    static defaultCss = `#resume {
    font-family: Georgia, serif;
    font-size: 10pt;
}

#resume * {
    /* Set all margins to zero, and then re-set them later */
    margin: 0;
}

#resume a, a:hover {
    color: #000000;
}

#resume header, #resume section {
    margin-bottom: 1.5em;
}

#resume header .resume-paragraph {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
}

#resume header .resume-paragraph p {
    margin-right: 1.0rem;
}

#resume .entry {
    margin-bottom: 0.75em;
}

/** Headers **/
#resume h1 {
    font-size: 1.8rem;
    text-align: center;
}

#resume h2 {
    font-size: 1.1rem;
}

#resume h3 {
    font-size: 1.05rem;
}

#resume h2.flex-col {
    /* Section with header on left */
    padding-right: 0.5rem;
    margin-right: 0.5rem;
    width: 150px;
}

#resume h2.flex-row.flex-spread {
    /* Section with header on top */
    border-bottom: 1px solid;
    align-items: self-end;
}

#resume p.subtitle {
    font-style: italic;
}

.entry-content, .entry {
    width: 100%;
}

/** Lists **/
#resume dd {
    padding-left: 0.5rem;
}

#resume ul {
    padding-left: 1.5em; /** Reduced padding */
}

#resume ul li {
    list-style-type: square; /** Default: circle */
}

/** Multi-Column Layouts */
#resume .column-0 {
    width: 33%;
    margin-right: 1.5rem;
    flex-shrink: 0; /** Do not shrink */
}

#resume .column-1 {
    width: 100%; /** Fill up remaining space */
}

/** Key Classes: Modify at your own risk **/
#resume .iflex-row {
    display: inline-flex;
}

#resume .flex-row {
    display: flex;
}

#resume .iflex-row, flex-row {
    flex-direction: row;
}

#resume .flex-col {
    display: flex;
    flex-direction: column;
}

#resume .flex-spread {
    justify-content: space-between;
}
`;

    static header = {
        type: 'Header',
        value: 'Your Name Here',
        children: [
            {
                type: 'Paragraph',
                value: '<p>Email: spamMePlz@spicymail.com</p><p>Phone: 123-456-7890</p>'
            }
        ]
    };

    static objective = {
        type: 'Section',
        title: 'Objective',
        children: [
            {
                type: 'Paragraph',
                value: 'To conquer the world.'
            }
        ]
    };

    static experience = {
        type: 'Section',
        title: 'Experience',
        children: [
            {
                type: 'Entry',
                title: 'Another Company',
                titleExtras: ['2019 -- Present'],
                subtitle: 'Senior Software Engineer',
                subtitleExtras: ['Sometown, USA'],
                children: [
                    {
                        type: 'List',
                        children: [
                            {
                                type: 'ListItem',
                                value: 'Increased productivity by conducting telepathic SCRUM meetings'
                            }
                        ]
                    }
                ]
            },
            {
                type: 'Entry',
                title: 'Some Company',
                titleExtras: ['2014 -- 2016'],
                subtitle: 'Software Engineer',
                subtitleExtras: ['Big City, USA'],
                children: [
                    {
                        type: 'List',
                        children: [
                            {
                                type: 'ListItem',
                                value: 'Did things with code while looking at a computer monitor'
                            }
                        ]
                    }
                ]
            }
        ]
    };

    static techSkills = {
        type: 'Section',
        title: 'Technical Skills',
        children: [
            {
                type: 'List',
                children: [
                    {
                        type: 'ListItem',
                        value: 'C++'
                    },
                    {
                        type: 'ListItem',
                        value: 'Web Development'
                    },
                    {
                        type: 'ListItem',
                        value: 'Agile/SCRUM'
                    }
                ]
            }
        ]
    };

    static education = {
        type: 'Section',
        title: 'Education',
        children: [
            {
                type: 'Entry',
                title: 'Some College',
                titleExtras: ['2010 -- 2014'],
                subtitle: 'BS in Some Major'
            }
        ]
    };

    static resumeChildren = [
        ResumeTemplateProvider.header,
        ResumeTemplateProvider.objective,
        ResumeTemplateProvider.experience,
        ResumeTemplateProvider.techSkills,
        ResumeTemplateProvider.education
    ]

    static templates = {
        "Traditional 1": () => {
            let data = {
                children: assignIds(ResumeTemplateProvider.resumeChildren),
                css: ResumeTemplateProvider.defaultCss,
                sectionTitlePosition: "top" as SectionHeaderPosition
            };

            for (let k in data.children) {
                const node = data.children[k];
                if (node['type'] == 'Section') {
                    node['headerPosition'] = 'top';
                }
            }

            return data;
        },

        "Traditional 2": () => {
            let data = {
                children: assignIds(ResumeTemplateProvider.resumeChildren),
                css: ResumeTemplateProvider.defaultCss,
                sectionTitlePosition: "left" as SectionHeaderPosition
            };

            for (let k in data.children) {
                const node = data.children[k];
                if (node['type'] == 'Section') {
                    node['headerPosition'] = 'left';
                }
            }

            return data;
        },

        "Multi-Column 1": () => {
            let data = {
                children: assignIds([
                    ResumeTemplateProvider.header,
                    ResumeTemplateProvider.objective,
                    {
                        type: 'FlexibleRow',
                        children: [
                            {
                                type: 'FlexibleColumn',
                                children: [
                                    ResumeTemplateProvider.education,
                                    ResumeTemplateProvider.techSkills
                                ]
                            },
                            {
                                type: 'FlexibleColumn',
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
        }
    }
}