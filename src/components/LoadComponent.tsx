import FlexibleRow, { FlexibleRowProps } from "./FlexibleRow";
import React = require("react");
import Section, { SectionProps } from "./Section";
import Entry, { EntryProps } from "./Entry";
import List, { ListItem } from "./List";
import Paragraph, { ParagraphProps } from "./Paragraph";
import Title, { TitleProps } from "./Title";
import { EditableProps } from "./Editable";

interface ExtraProps {
    addChild?: (idx: number, node: object) => void;
    toggleEdit?: (idx: number) => void;
    updateData?: (idx: number, key: string, data: any) => void;
}

export default function loadComponent(data: object, extraProps?: ExtraProps, stopRecurse = false) {
    // Load prop data
    let props = {};
    for (let key in data) {
        if (data[key] != 'children' && data[key] != 'type') {
            props[key] = data[key];
        }
    }

    if (extraProps) {
        props['addChild'] = extraProps.addChild;
        props['toggleEdit'] = extraProps.toggleEdit;
        props['updateData'] = extraProps.updateData;
    }

    props['children'] = new Array();

    // Load children
    if (data['children'] && !stopRecurse) {
        props['children'] = data['children'];
    }

    switch (data['type']) {
        case 'FlexibleRow':
            return <FlexibleRow {...props as FlexibleRowProps } />;
        case 'Section':
            return <Section {...props as SectionProps} />;
        case 'Entry':
            return <Entry {...props as EntryProps} />;
        case 'List':
            return <List {...props} />;
        case 'ListItem':
            return <ListItem {...props as EditableProps} />;
        case 'Paragraph':
            return <Paragraph {...props as ParagraphProps} />;
        case 'Title':
            let title = new Title(props as TitleProps);
            return title.render();
            // return <Title {...props as TitleProps} />;
    }
}