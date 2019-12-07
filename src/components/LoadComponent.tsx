import * as React from "react";

import FlexibleRow, { FlexibleColumn } from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem, DescriptionList, DescriptionListItem } from "./List";
import Paragraph from "./Paragraph";
import Header from "./Header";
import { ResumeComponentProps, Action, SelectedNodeProps } from "./ResumeComponent";

export type EditorMode = 'normal' | 'editingStyle' | 'changingTemplate' | 'printing';

interface ExtraProps {
    uuid: string;
    mode: EditorMode;
    unselect: () => void;
    updateSelected: (data?: SelectedNodeProps) => void;

    addChild?: (node: object) => void;
    isSelectBlocked?: (id: string) => boolean;
    hoverInsert?: (id: string) => void;
    hoverOut?: (id: string) => void;
    moveUp?: () => void;
    moveDown?: () => void;
    deleteChild?: () => void;
    toggleEdit?: () => void;
    updateData?: (key: string, data: any) => void;
}

/**
 * Load a resume node from a JavaScript object
 * @param data
 * @param index       The n-th index of this node relative to its parent
 * @param numChildren How many total siblings this node has plus itself
 * @param extraProps  Props passed down from parent (such as functions)
 * @param parentIndex The n-th index of this node's parent relative to its parent
 */
export default function loadComponent(data: object,
    index: number, numChildren: number, extraProps?: ExtraProps, parentIndex?: string) {
    // Load prop data
    let propsDraft = {};
    for (let key in data) {
        if (data[key] != 'children' && data[key] != 'type') {
            propsDraft[key] = data[key];
        }
    }

    // Generate unique IDs for component
    propsDraft['id'] = parentIndex ? parentIndex + '-' + index.toString() : index.toString();
    propsDraft['isFirst'] = (index == 0);
    propsDraft['isLast'] = (index == numChildren - 1);

    // Load props passed from parent
    if (extraProps) {
        for (let key in extraProps) {
            propsDraft[key] = extraProps[key];
        }
    }

    // Load children
    propsDraft['children'] = new Array();
    const children = data['children'] as Array<object>;
    if (children) {
        propsDraft['children'] = children;
    }

    const props = propsDraft as ResumeComponentProps;
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