import * as React from "react";

import Section from "./Section";
import Entry from "./Entry";
import DescriptionList, { DescriptionListItem } from "./List";
import RichText from "./RichText";
import Header from "./Header";
import { ResumeNodeProps, ResumePassProps } from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";
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