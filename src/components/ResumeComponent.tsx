import * as React from "react";

import Row, { Column } from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem, DescriptionList, DescriptionListItem } from "./List";
import Paragraph from "./Paragraph";
import Header from "./Header";
import { ResumeNodeProps, ResumePassProps, Action } from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'editingStyle'
    | 'changingTemplate'
    | 'printing';

interface ResumeComponentProps extends ResumePassProps {
    index: number;       // The n-th index of this node relative to its parent
    numChildren: number; // How many total siblings this node has plus itself
    parentId?: IdType;   // The id of the parent node
}

/**
 * Load a resume node from a JavaScript object
 */
export default function ResumeComponent(props: ResumeComponentProps) {
    const parentId = props.parentId;
    const index = props.index;

    let newProps = {
        ...props,

        // Generate unique IDs for component
        id: parentId ? [...parentId, index] : [index],
        isFirst: (index === 0),
        isLast: (index === props.numChildren - 1)
    } as ResumeNodeProps;
    
    switch (props['type']) {
        case 'DescriptionList':
            return <DescriptionList {...newProps} />;
        case 'DescriptionListItem':
            return <DescriptionListItem {...newProps} />;
        case Column.getType():
        case 'FlexibleColumn':
            return <Column {...newProps} />;
        case Row.getType():
        case 'FlexibleRow':
            return <Row {...newProps} />;
        case 'Header':
            return <Header {...newProps} />
        case 'Section':
            return <Section {...newProps as SectionProps} />;
        case 'Entry':
            return <Entry {...newProps as EntryProps} />;
        case 'List':
            return <List {...newProps} />;
        case 'ListItem':
            return <ListItem {...newProps} />;
        case 'Paragraph':
            return <Paragraph {...newProps} />;
        default:
            return <React.Fragment></React.Fragment>
    }
}