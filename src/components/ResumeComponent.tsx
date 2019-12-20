import * as React from "react";

import Section, { SectionProps } from "./Section";
import Entry, { BasicEntryProps } from "./Entry";
import { DescriptionList, DescriptionListItem } from "./List";
import RichText from "./Paragraph";
import Header from "./Header";
import { ResumeNodeProps, ResumePassProps } from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";
import { BasicResumeNode } from "./utility/NodeTree";
import Row from "./Row";
import Column from "./Column";

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
        isLast: index == props.numSiblings - 1
    } as ResumeNodeProps;
    
    switch (props.type) {
        case DescriptionList.name:
            return <DescriptionList {...newProps} />;
        case DescriptionListItem.name:
            return <DescriptionListItem {...newProps} />;
        case Column.name:
            return <Column {...newProps} />;
        case Row.name:
            return <Row {...newProps} />;
        case Header.name:
            return <Header {...newProps} />
        case Section.name:
            return <Section {...newProps as SectionProps} />;
        case Entry.name:
            return <Entry {...newProps} />;
        case RichText.name:
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
            case Row.name:
                return Column.name;
            case DescriptionList.name:
                return DescriptionListItem.name;
            case Entry.name:
                return [
                    AliasTypes.BulletedList,
                    DescriptionList.name,
                    RichText.name
                ];
            default:
                return [
                    Section.name,
                    Entry.name,
                    RichText.name,
                    AliasTypes.BulletedList,
                    DescriptionList.name
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
            case DescriptionList.name:
                return ['Description List'];
            case DescriptionListItem.name:
                return ['Description List'];
            case RichText.name:
                return ['Rich Text'];
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
                        type: RichText.name,
                        value: '<ul><li></li></ul>'
                    }
                }
            case Column.name:
                return {
                    text: Column.name,
                    node: {
                        type: Column.name
                    }
                }
            case DescriptionList.name:
                return {
                    text: 'Description List',
                    node: {
                        type: DescriptionList.name,
                        children: [
                            {
                                type: DescriptionListItem.name
                            }
                        ]
                    }
                }
            case DescriptionListItem.name:
                return {
                    text: 'Description List Item',
                    node: { type: DescriptionListItem.name }
                }
            case Entry.name:
                return {
                    text: 'Entry',
                    node: {
                        type: Entry.name,
                        title: [''],
                        subtitle: ['']
                    } as BasicEntryProps
                }
            case RichText.name:
                return {
                    text: 'Rich Text',
                    node: {
                        type: RichText.name
                    }
                }
            case Row.name:
                return {
                    text: Row.name,
                    node: {
                        type: Row.name,
                        children: [
                            { type: Column.name },
                            { type: Column.name }
                        ]
                    }
                }
            case Section.name:
                return {
                    text: Section.name,
                    node: {
                        type: Section.name
                    }
                }
            default:
                throw new Error(`Couldn't find information for component named ${type}`);
        }
    }
}

/** Stores types which are just an alias for another type */
export class AliasTypes {
    static get BulletedList() {
        return 'BulletedList';
    }
}