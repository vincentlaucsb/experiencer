import { SectionHeaderPosition } from "./Section";
import { assignIds, deepCopy } from "./Helpers";

export default class ResumeTemplateProvider {
    static defaultCss = `
#resume * {
    /* Set all margins to zero, and then re-set them later */
    margin: 0;
}

/** Headers **/
#resume h2.flex-col {
    /* Section with header on left */
    padding-right: 0.5rem;
    margin-right: 0.5rem;
    width: 150px;
}

/** Lists **/
#resume dd {
    padding-left: 0.5rem;
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
#resume div.text-inline p {
    /** Disabled line breaks */
    display: inline;
    margin-right: 1rem;
}

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

    static get header() {
        return {
            type: 'Header',
            value: 'Your Name Here',
            children: [
                {
                    type: 'Paragraph',
                    value: '<p>Email: spamMePlz@spicymail.com</p><p>Phone: 123-456-7890</p>'
                }
            ]
        };
    }

    static get objective() {
        return {
            type: 'Section',
            title: 'Objective',
            children: [
                {
                    type: 'Paragraph',
                    value: 'To conquer the world.'
                }
            ]
        };
    }

    static get experience() {
        return {
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
        }
    };

    static get techSkills() {
        return {
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
        }
    };

    static get education() {
        return {
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
                ]) as Array<object>,
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
                ]) as Array<object>,
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
                        type: 'Row',
                        children: [
                            {
                                type: 'Column',
                                children: [
                                    ResumeTemplateProvider.education,
                                    ResumeTemplateProvider.techSkills
                                ]
                            },
                            {
                                type: 'Column',
                                children: [
                                    ResumeTemplateProvider.experience
                                ]
                            }
                        ]
                    }
                ]) as Array<object>,
                css: ResumeTemplateProvider.defaultCss,
            };

            return data;
        }
    }
}