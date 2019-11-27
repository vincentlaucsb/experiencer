import * as React from "react";
import FlexibleRow from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem } from "./List";
import Paragraph from "./Paragraph";
import Title from "./Title";
import { ResumeComponentProps } from "./ResumeComponent";

interface ExtraProps {
    isPrinting?: boolean;

    addChild?: (node: object) => void;
    moveUp?: () => void;
    moveDown?: () => void;
    deleteChild?: () => void;
    toggleEdit?: () => void;
    updateData?: (key: string, data: any) => void;
}

export default function loadComponent(data: object, extraProps?: ExtraProps,
isFirst = false, isLast = false) {
    // Load prop data
    let props: ResumeComponentProps = {};
    for (let key in data) {
        if (data[key] != 'children' && data[key] != 'type') {
            props[key] = data[key];
        }
    }

    props['isFirst'] = isFirst;
    props['isLast'] = isLast;

    if (extraProps) {
        props['addChild'] = extraProps.addChild;
        props['deleteChild'] = extraProps.deleteChild;
        props['moveUp'] = extraProps.moveUp;
        props['moveDown'] = extraProps.moveDown;
        props['toggleEdit'] = extraProps.toggleEdit;
        props['updateData'] = extraProps.updateData;
        props['isPrinting'] = extraProps.isPrinting;
    }

    props['children'] = new Array();

    // Load children
    const children = data['children'] as Array<object>;
    if (children) {
        props['children'] = children;
    }

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