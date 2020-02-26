import * as React from "react";

import Section from "./Section";
import Entry from "./Entry";
import DescriptionList, { DescriptionListItem } from "./List";
import RichText from "./RichText";
import Header from "./Header";
import Row from "./Row";
import Column from "./Column";
import Grid from "./Grid";
import Icon from "./Icon";
import ResumeComponentProps, { IdType, NodeProperty, ResumeNode } from "./utility/Types";
import Divider from "./Divider";

interface FactoryProps extends ResumeNode {
    index: number;       // The n-th index of this node relative to its parent
    numSiblings: number; // Number of siblings this node has
    parentId?: IdType;   // The id of the parent node
    updateResumeData: (id: IdType, key: string, data: NodeProperty) => void
}

/**
 * Factory for loading a resume node from a JavaScript object
 */
export default function ResumeComponentFactory(props: FactoryProps) {
    const parentId = props.parentId;
    const index = props.index;
    const nodeId = parentId ? [...parentId, index] : [index];

    let newProps = {
        ...props,

        // Compute properties
        updateData: (key, data) => props.updateResumeData(nodeId, key, data),

        // Generate unique IDs for component
        id: nodeId,
        isLast: index === props.numSiblings - 1
    } as ResumeComponentProps;

    let Container: typeof React.Component;
    switch (props.type) {
        case DescriptionList.type:
            Container = DescriptionList;
            break;
        case DescriptionListItem.type:
            Container = DescriptionListItem;
            break;
        case Divider.type:
            Container = Divider;
            break;
        case Grid.type:
            Container = Grid;
            break;
        case Column.type:
            Container = Column;
            break;
        case Row.type:
            Container = Row;
            break;
        case Header.type:
            Container = Header;
            break;
        case Section.type:
            Container = Section;
            break;
        case Entry.type:
            Container = Entry;
            break;
        case RichText.type:
            Container = RichText;
            break;
        case Icon.type:
            Container = Icon;
            break;
        default:
            return <React.Fragment></React.Fragment>
    }

    if (Container) {
        let children: React.ReactNode = <></>
        if (props.childNodes) {
            children = props.childNodes.map((elem, idx, arr) => {
                const uniqueId = elem.uuid;
                const childProps = {
                    ...elem,
                    updateResumeData: props.updateResumeData,

                    index: idx,
                    numSiblings: arr.length,

                    // Crucial for generating IDs so hover/select works properly
                    parentId: newProps.id
                };

                return <ResumeComponentFactory key={uniqueId} {...childProps} />
            })
        }

        return <Container {...newProps}>
            {children}
        </Container>
    }

    return <React.Fragment></React.Fragment>
}