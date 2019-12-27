import * as React from "react";

import Section from "./Section";
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
import Icon from "./Icon";

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'changingTemplate'
    | 'printing';

interface ResumeComponentProps extends ResumePassProps {
    index: number;       // The n-th index of this node relative to its parent
    isEditing: boolean;
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
            return <Section {...newProps} />;
        case Entry.type:
            return <Entry {...newProps} />;
        case RichText.type:
            return <RichText {...newProps} />;
        case Icon.type:
            return <Icon {...newProps} />
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
                    Icon.type,
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
            case Icon.type:
                return {
                    text: Icon.type,
                    node: {
                        type: Icon.type
                    }
                }
            default:
                throw new Error(`Couldn't find information for component named ${type}`);
        }
    }
}

class AliasTypes {
    static readonly BulletedList = 'Bulleted List';
}