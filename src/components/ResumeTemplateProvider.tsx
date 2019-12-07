import { SectionHeaderPosition } from "./Section";
import uuid from 'uuid/v4';
import { assignIds } from "./Helpers";

export default class ResumeTemplateProvider {
    static defaultCss = `#resume {
    font-family: Georgia, sans-serif;
    font-size: 10pt;
}

#resume * {
    margin: 0;
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

#resume ul {
    padding-left: 1.5em;
}

#resume h1 {
    font-size: 1.8rem;
    text-align: center;
}

h2 {
    font-size: 1.1rem;
}

h3 {
    font-size: 1.05rem;
}

h2.flex-row.flex-spread {
    border-bottom: 1px solid;
    align-items: self-end;
}

.entry-content, .entry {
    width: 100%;
}

.flex-row {
    display: flex;
    flex-direction: row;
}

.flex-spread {
    justify-content: space-between;
}

.flex-col {
    display: flex;
    flex-direction: column;
}

#resume dt {
    min-width: 20%;
    padding-right: 0.5rem;
    flex-shrink: 2;
}

#resume dd {
    flex-grow: 2;
}

#resume h2.flex-col {
    border: 0;
    padding-right: 0.5rem;
    margin-right: 0.5rem;
    width: 150px;
}

#resume p.subtitle {
    font-style: italic;
}

#resume .column-0 {
    width: 33%;
    margin-right: 1.5rem;
    flex-shrink: 0;
}

#resume .column-1 {
    width: 100%;
}
`;

    static header = {
        type: 'Header',
        value: 'Your Name Here',
        children: [
            {
                type: 'Paragraph',
                value: '<p>Email: vincela9@hotmail.com</p><p>Phone: 123-456-7890</p>'
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

    static Traditional1() {
        let data = {
            activeTemplate: 'Traditional 1',
            children: assignIds(ResumeTemplateProvider.resumeChildren),
            customCss: this.defaultCss,
            sectionTitlePosition: "top" as SectionHeaderPosition
        };

        for (let k in data.children) {
            const node = data.children[k];
            if (node['type'] == 'Section') {
                node['headerPosition'] = 'top';
            }
        }

        return data;
    }

    static Traditional2() {
        let data = {
            activeTemplate: 'Traditional 2',
            children: assignIds(ResumeTemplateProvider.resumeChildren),
            customCss: this.defaultCss,
            sectionTitlePosition: "left" as SectionHeaderPosition
        };

        for (let k in data.children) {
            const node = data.children[k];
            if (node['type'] == 'Section') {
                node['headerPosition'] = 'left';
            }
        }

        return data;
    }

    static MultiColumn1() {
        let data = {
            activeTemplate: 'Multi-Column 1',
            children: assignIds([
                ResumeTemplateProvider.header,
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
            customCss: this.defaultCss,
        };

        return data;
    }
}