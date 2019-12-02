import * as React from "react";
import FlexibleRow from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem } from "./List";
import Paragraph from "./Paragraph";
import Title from "./Title";
import { ResumeComponentProps, SelectedComponentProps } from "./ResumeComponent";

export type EditorMode = 'normal' | 'editingStyle' | 'changingTemplate' | 'printing';

interface ExtraProps {
    mode: EditorMode;
    unselect: () => void;
    updateSelected: (data: SelectedComponentProps) => void;

    addChild?: (node: object) => void;
    moveUp?: () => void;
    moveDown?: () => void;
    deleteChild?: () => void;
    toggleEdit?: () => void;
    updateData?: (key: string, data: any) => void;
}

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
        case 'FlexibleRow':
            return <FlexibleRow {...props} />;
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
        case 'Title':
            return <Title {...props} />;
    }
}