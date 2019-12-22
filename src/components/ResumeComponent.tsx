import * as React from "react";

import Section, { SectionProps } from "./Section";
import Entry, { BasicEntryProps } from "./Entry";
import DescriptionList, { DescriptionListItem } from "./List";
import RichText from "./RichText";
import Header from "./Header";
import { ResumeNodeProps, ResumePassProps } from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";
import { BasicResumeNode } from "./utility/NodeTree";
import Row from "./Row";
import Column from "./Column";
import Grid from "./Grid";
import * as octions from "@primer/octicons";
import * as phone from "../icons/feather/phone.svg";
import * as linkedIn from "../icons/LI-In-Bug.png";

function githubLogo() {
    let svg: string = octions['mark-github'].toSVG();
    svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');

    const encoded = window.btoa(svg);
    return `<img
    src='data:image/svg+xml;base64,${encoded}'
    style='height: 24px'
    alt="GitHub" />`

}

function globeIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-globe"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`;
    const encoded = window.btoa(svg);
    return `<img
    src='data:image/svg+xml;base64,${encoded}'
    style='height: 24px'
    alt="Website" />`
}

function phoneIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-phone"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
    const encoded = window.btoa(svg);
    return `<img
    src='data:image/svg+xml;base64,${encoded}'
    style='height: 24px'
    alt="Phone" />`
}

function linkedInLogo() {
    return `<img src="${linkedIn}" style='height: 24px' alt="LinkedIn">`
}

function emailIcon() {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-mail"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
    const encoded = window.btoa(svg);
    return `<img
    style='height: 24px'
    src='data:image/svg+xml;base64,${encoded}'
    alt="Email" />`
}

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'editingStyle'
    | 'changingTemplate'
    | 'printing';

interface ResumeComponentProps extends ResumePassProps {
    index: number;       // The n-th index of this node relative to its parent
    numSiblings: number; // Number of siblings this node has
    parentId?: IdType;   // The id of the parent node
}

/**
 * Factory for loading a resume node from a JavaScript object
 */
export default function ResumeComponent(props: ResumeComponentProps) {
    const parentId = props.parentId;
    const index = props.index;

    let newProps = {
        ...props,

        // Generate unique IDs for component
        id: parentId ? [...parentId, index] : [index],
        isLast: index === props.numSiblings - 1
    } as ResumeNodeProps;
    
    switch (props.type) {
        case DescriptionList.type:
            return <DescriptionList {...newProps} />;
        case DescriptionListItem.type:
            return <DescriptionListItem {...newProps} />;
        case Grid.type:
            return <Grid {...newProps} />;
        case Column.type:
            return <Column {...newProps} />;
        case Row.type:
            return <Row {...newProps} />;
        case Header.type:
            return <Header {...newProps} />
        case Section.type:
            return <Section {...newProps as SectionProps} />;
        case Entry.type:
            return <Entry {...newProps} />;
        case RichText.type:
            return <RichText {...newProps} />;
        default:
            return <React.Fragment></React.Fragment>
    }
}

export interface NodeInformation {
    text: string;
    node: BasicResumeNode;
}

/** Stores schema information */
export class ComponentTypes {

    /**
     * Given a type return what children its allowed to have
     * @param type Type of resume node
     */
    static childTypes(type: string) : string | Array<string> {
        switch (type) {
            case Grid.type:
                return [
                    Row.type,
                    Column.type,
                    Section.type,
                    Entry.type,
                    RichText.type,
                    AliasTypes.BulletedList,
                    DescriptionList.type
                ];
            case Row.type:
                return Column.type;
            case Column.type:
                return [
                    Row.type,
                    Grid.type,
                    Section.type,
                    Entry.type,
                    RichText.type,
                    AliasTypes.BulletedList,
                    DescriptionList.type
                ]
            case DescriptionList.type:
                return DescriptionListItem.type;
            case Entry.type:
                return [
                    AliasTypes.BulletedList,
                    DescriptionList.type,
                    RichText.type
                ];
            case Header.type:
                return [
                    AliasTypes.Contact,
                    Entry.type,
                    RichText.type,
                    AliasTypes.BulletedList,
                    DescriptionList.type,
                    Grid.type
                ];
            case RichText.type:
                return [];
            case Section.type:
                return [
                    Section.type,
                    Entry.type,
                    RichText.type,
                    AliasTypes.BulletedList,
                    DescriptionList.type,
                    Grid.type,
                    Row.type
                ]
            default:
                return [
                    Section.type,
                    Entry.type,
                    RichText.type,
                    AliasTypes.BulletedList,
                    DescriptionList.type
                ];
        }
    }

    /**
     * Given a node type return its corresponding path in the 
     * CSS settings
     * @param type
     */
    static cssName(type: string) : string[] {
        switch (type) {
            case DescriptionList.type:
                return ['Description List'];
            case DescriptionListItem.type:
                return ['Description List'];
            case RichText.type:
                return ['Rich Text'];
            case Column.type:
                return [Row.type, Column.type];
            default:
                return [type];
        }
    }

    /**
     * Given a type retrieve its JSON representation
     * @param type
     */
    static defaultValue(type: string) : NodeInformation {
        switch (type) {
            case AliasTypes.BulletedList:
                return {
                    text: 'Bulleted List',
                    node: {
                        type: RichText.type,
                        value: '<ul><li></li></ul>'
                    }
                }
            case Column.type:
                return {
                    text: Column.type,
                    node: {
                        type: Column.type
                    }
                }
            case AliasTypes.Contact:
                return {
                    text: 'Contact',
                    node: {
                        type: RichText.type,
                        value: `
<p>Phone ${phoneIcon()}</p>
<p>Email ${emailIcon()}</p>
<p>Website ${globeIcon()}</p>
<p>GitHub ${githubLogo()}</p>
<p>LinkedIn ${linkedInLogo()}</p>
`
                    }
                }
            case DescriptionList.type:
                return {
                    text: 'Description List',
                    node: {
                        type: DescriptionList.type,
                        children: [
                            {
                                type: DescriptionListItem.type
                            }
                        ]
                    }
                }
            case DescriptionListItem.type:
                return {
                    text: 'Description List Item',
                    node: { type: DescriptionListItem.type }
                }
            case Entry.type:
                return {
                    text: 'Entry',
                    node: {
                        type: Entry.type,
                        title: [''],
                        subtitle: ['']
                    } as BasicEntryProps
                }
            case Grid.type:
                return {
                    text: 'Grid',
                    node: {
                        type: Grid.type
                    }
                }
            case RichText.type:
                return {
                    text: 'Rich Text',
                    node: {
                        type: RichText.type
                    }
                }
            case Row.type:
                return {
                    text: Row.type,
                    node: {
                        type: Row.type,
                        children: [
                            { type: Column.type },
                            { type: Column.type }
                        ]
                    }
                }
            case Section.type:
                return {
                    text: Section.type,
                    node: {
                        type: Section.type
                    }
                }
            default:
                throw new Error(`Couldn't find information for component named ${type}`);
        }
    }

    /**
     * Whether or not it makes sense to "edit" a type
     * @param type
     */
    static isEditable(type: string) {
        let editable = new Set([
            Section.type, RichText.type, Header.type, DescriptionListItem.type, Entry.type
        ]);

        return editable.has(type);
    }
}

class AliasTypes {
    static readonly BulletedList = 'Bulleted List';
    static readonly Contact = 'Contact';
}