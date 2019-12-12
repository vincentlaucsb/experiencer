import * as React from "react";

import FlexibleRow, { FlexibleColumn } from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem, DescriptionList, DescriptionListItem } from "./List";
import Paragraph from "./Paragraph";
import Header from "./Header";
import { ResumeComponentProps, SelectedNodeProps, Action } from "./ResumeComponent";
import { IdType } from "./utility/HoverTracker";

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'editingStyle'
    | 'changingTemplate'
    | 'printing';

interface ExtraProps {
    uuid: string;
    isHovering: (id: IdType) => boolean;
    toggleParentHighlight?: (isHovering: boolean) => void;
    isSelected: (id: string) => boolean;
    isSelectBlocked: (id: IdType) => boolean;
    deleteChild: () => void;
    mode: EditorMode;
    unselect: () => void;
    updateSelected: (data?: SelectedNodeProps) => void;

    addChild?: (node: object) => void;
    hoverInsert?: (id: IdType) => void;
    hoverOut?: (id: IdType) => void;
    moveUp?: Action;
    moveDown?: Action;
    toggleEdit?: Action;
    updateData?: (key: string, data: any) => void;
}

/**
 * Load a resume node from a JavaScript object
 * @param data
 * @param index       The n-th index of this node relative to its parent
 * @param numChildren How many total siblings this node has plus itself
 * @param parentId    The id of the parent node
 */
export default function loadComponent(data: ExtraProps,
    index: number, numChildren: number, parentId?: IdType) {
    let props = {
        ...data,

        // Generate unique IDs for component
        id: parentId ? [...parentId, index] : [index],
        isFirst: (index === 0),
        isLast: (index === numChildren - 1)
    } as ResumeComponentProps;
    
    if (!props.children) {
        props.children = new Array<object>();
    }

    switch (data['type']) {
        case 'DescriptionList':
            return <DescriptionList {...props} />;
        case 'DescriptionListItem':
            return <DescriptionListItem {...props} />;
        case 'FlexibleColumn':
            return <FlexibleColumn {...props} />;
        case 'FlexibleRow':
            return <FlexibleRow {...props} />;
        case 'Header':
            return <Header {...props} />
        case 'Section':
            return <Section {...props as SectionProps} />;
        case 'Entry':
            return <Entry {...props as EntryProps} />;
        case 'List':
            return <List {...props} />;
        case 'ListItem':
            return <ListItem {...props} />;
        case 'Paragraph':
            return <Paragraph {...props} />;
    }
}