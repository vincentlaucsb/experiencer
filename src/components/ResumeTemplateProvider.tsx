import Section, { SectionHeaderPosition } from "./Section";
import { assignIds } from "./Helpers";
import Header from "./Header";
import Entry from "./Entry";
import Paragraph from "./Paragraph";

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
                    type: 'Paragraph',
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
                    type: 'Paragraph',
                    value: 'To conquer the world.'
                }
            ]
        };
    }

    static get experience() {
        return {
            type: Section.name,
            title: 'Experience',
            children: [
                {
                    type: Entry.name,
                    title: 'Another Company',
                    titleExtras: ['2019 -- Present'],
                    subtitle: 'Senior Software Engineer',
                    subtitleExtras: ['Sometown, USA'],
                    children: [
                        this.makeList([
                            'Increased productivity by conducting telepathic SCRUM meetings'
                        ])
                    ]
                },
                {
                    type: Entry.name,
                    title: 'Some Company',
                    titleExtras: ['2014 -- 2016'],
                    subtitle: 'Software Engineer',
                    subtitleExtras: ['Big City, USA'],
                    children: [
                        this.makeList([
                            'Did things with code while looking at a computer monitor'
                        ])
                    ]
                }
            ]
        }
    };

    static get techSkills() {
        return {
            type: Section.name,
            title: 'Technical Skills',
            children: [
                this.makeList([ 'C++', 'Web Development', 'Agile/SCRUM' ])
            ]
        }
    };

    static get education() {
        return {
            type: Section.name,
            title: 'Education',
            children: [
                {
                    type: Entry.name,
                    title: 'Some College',
                    titleExtras: ['2010 -- 2014'],
                    subtitle: 'BS in Some Major'
                }
            ]
        };
    }

    /**
     * Construct a bulleted list
     * @param items A list of items
     */
    static makeList(items: Array<string>) {
        let value = "";
        items.forEach((i) => {
            value += `<li>${i}</li>`
        });

        return {
            type: Paragraph.name,
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
                ]),
                css: ResumeTemplateProvider.defaultCss,
            };

            return data;
        }
    }
}