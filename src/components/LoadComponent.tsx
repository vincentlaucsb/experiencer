import * as React from "react";
import FlexibleRow from "./FlexibleRow";
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem } from "./List";
import Paragraph from "./Paragraph";
import Title from "./Title";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";

interface ExtraProps {
    addChild?: (node: object) => void;
    deleteChild?: (idx: number) => void;
    toggleEdit?: () => void;
    updateData?: (key: string, data: any) => void;
}

export default function loadComponent(data: object, extraProps?: ExtraProps) {
    // Load prop data
    let props: ResumeComponentProps = {};
    for (let key in data) {
        if (data[key] != 'children' && data[key] != 'type') {
            props[key] = data[key];
        }
    }

    if (extraProps) {
        props['addChild'] = extraProps.addChild;
        props['deleteChild'] = extraProps.deleteChild;
        props['toggleEdit'] = extraProps.toggleEdit;
        props['updateData'] = extraProps.updateData;
    }

    props['children'] = new Array();

    // Load children
    if (data['children']) {
        props['children'] = data['children'];
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