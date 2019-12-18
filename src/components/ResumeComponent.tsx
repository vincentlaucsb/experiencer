import * as React from "react";

import Row, { Column } from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import { DescriptionList, DescriptionListItem } from "./List";
import Paragraph from "./Paragraph";
import Header from "./Header";
import { ResumeNodeProps, ResumePassProps } from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";
import { BasicResumeNode } from "./utility/NodeTree";

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'editingStyle'
    | 'changingTemplate'
    | 'printing';

interface ResumeComponentProps extends ResumePassProps {
    index: number;       // The n-th index of this node relative to its parent
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
        id: parentId ? [...parentId, index] : [index]
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
            return <Entry {...newProps as EntryProps} />;
        case Paragraph.name:
            return <Paragraph {...newProps} />;
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
                    Paragraph.name
                ];
            default:
                return [
                    Section.name,
                    Entry.name,
                    Paragraph.name,
                    AliasTypes.BulletedList,
                    DescriptionList.name
                ];
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
                    text: Paragraph.name,
                    node: {
                        type: Paragraph.name,
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
                        type: Entry.name
                    }
                }
            case Paragraph.name:
                return {
                    text: 'Rich Text',
                    node: {
                        type: Paragraph.name
                    }
                }
            case Row.name:
                return {
                    text: Row.name,
                    node: {
                        type: Row.name
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
                throw `Couldn't find information for component named ${type}`;
        }
    }
}

/** Stores types which are just an alias for another type */
export class AliasTypes {
    static get BulletedList() {
        return 'BulletedList';
    }
}