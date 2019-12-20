import Section, { SectionHeaderPosition, BasicSectionProps } from "../Section";
import { assignIds } from "../Helpers";
import Header from "../Header";
import Entry, { BasicEntryProps } from "../Entry";
import RichText from "../RichText";
import { BasicResumeNode } from "../utility/NodeTree";
import Column from "../Column";
import Row from "../Row";
import { randyMarshCss, randyMarsh } from "./RandyMarsh";
import getDefaultCss from "./CssTemplates";
import { ResumeSaveData } from "../controls/ResumeState";

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
            type: Header.type,
            value: 'Your Name Here',
            children: [
                {
                    type: RichText.type,
                    value: '<p>Email: spamMePlz@spicymail.com</p><p>Phone: 123-456-7890</p>'
                }
            ]
        };
    }

    static get objective() {
        return {
            type: Section.type,
            title: 'Objective',
            children: [
                {
                    type: RichText.type,
                    value: 'To conquer the world.'
                }
            ]
        } as BasicSectionProps;
    }

    static get experience() {
        return {
            type: Section.type,
            title: 'Experience',
            children: [
                {
                    type: Entry.type,
                    title: ['Another Company', '2019 -- Present'],
                    subtitle: ['Senior Software Engineer', 'Sometown, USA'],
                    children: [
                        this.makeList([
                            'Increased productivity by conducting telepathic SCRUM meetings'
                        ])
                    ]
                } as BasicEntryProps,
                {
                    type: Entry.type,
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
            type: Section.type,
            title: 'Technical Skills',
            children: [
                this.makeList([ 'C++', 'Web Development', 'Agile/SCRUM' ])
            ]
        } as BasicSectionProps
    };

    static get education() {
        return {
            type: Section.type,
            title: 'Education',
            children: [
                {
                    type: Entry.type,
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
            type: RichText.type,
            value: `<ul>${value}</ul>`
        };
    }

    static templates = {
        "Traditional 1": () => {
            let header = ResumeTemplateProvider.header;
            header.children[0]['disableLineBreaks'] = true;

            let data: ResumeSaveData = {
                builtinCss: getDefaultCss().dump(),

                // TODO: IDs are double assigned
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

            let data: ResumeSaveData = {
                builtinCss: getDefaultCss().dump(),
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

            let data: ResumeSaveData = {
                builtinCss: getDefaultCss().dump(),
                children: assignIds([
                    header,
                    ResumeTemplateProvider.objective,
                    {
                        type: Row.type,
                        children: [
                            {
                                type: Column.type,
                                children: [
                                    ResumeTemplateProvider.education,
                                    ResumeTemplateProvider.techSkills
                                ]
                            },
                            {
                                type: Column.type,
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
            let data: ResumeSaveData = {
                builtinCss: randyMarshCss().dump(),
                children: assignIds([ randyMarsh() ]),
                css: `${ResumeTemplateProvider.defaultCss}

#resume #sidebar h2 {
    color: #43353f;
}`
            };

            return data;
        }
    }
}