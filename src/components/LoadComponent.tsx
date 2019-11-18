import FlexibleRow, { FlexibleRowProps } from "./FlexibleRow";
import React = require("react");
import Section, { SectionProps } from "./Section";
import Entry from "./Entry";
import List, { ListItem } from "./List";
import Paragraph from "./Paragraph";
import Title, { TitleProps } from "./Title";

export default function loadComponent(data: object) {
    // Load prop data
    let props = {};
    for (let key in data) {
        if (data[key] != 'children' && data[key] != 'type') {
            props[key] = data[key];
        }
    }

    // Load children
    if (data['children']) {
        props['children'] = new Array();

        for (let child of data['children']) {
            console.log("LOADING CHILD", child);
            props['children'].push(loadComponent(child));
        }
    }

    console.log("loadComponent() called", data);
    switch (data['type']) {
        case 'FlexibleRow':
            return <FlexibleRow {...props as FlexibleRowProps } />;
        case 'Section':
            return <Section {...props as SectionProps} />;
        case 'Entry':
            return <Entry {...props} />;
        case 'List':
            return <List {...props} />;
        case 'ListItem':
            return <ListItem {...props} />;
        case 'Paragraph':
            return <Paragraph {...props} />;
        case 'Title':
            console.log("TITLE PROPS", props);
            return <Title {...props as TitleProps} />;
    }
}