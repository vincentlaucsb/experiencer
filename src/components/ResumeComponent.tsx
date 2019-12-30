import * as React from "react";

import Section from "./Section";
import Entry from "./Entry";
import DescriptionList, { DescriptionListItem } from "./List";
import RichText from "./RichText";
import Header from "./Header";
import ResumeNodeProps, { ResumePassProps } from "./ResumeNodeProps";
import Row from "./Row";
import Column from "./Column";
import Grid from "./Grid";
import Icon from "./Icon";
import { IdType, NodeProperty } from "./utility/Types";

export type EditorMode = 'normal'
    | 'landing'
    | 'help'
    | 'changingTemplate'
    | 'printing';

interface ResumeComponentProps extends ResumePassProps {
    index: number;       // The n-th index of this node relative to its parent
    resumeIsEditing: boolean;
    numSiblings: number; // Number of siblings this node has
    parentId?: IdType;   // The id of the parent node
    updateResumeData: (id: IdType, key: string, data: NodeProperty) => void;
}

/**
 * Factory for loading a resume node from a JavaScript object
 */
export default function ResumeComponent(props: ResumeComponentProps) {
    const parentId = props.parentId;
    const index = props.index;
    const isSelected = props.selectedUuid === props.uuid;
    const nodeId = parentId ? [...parentId, index] : [index];

    let newProps = {
        ...props,

        // Compute properties
        updateData: (key, data) => props.updateResumeData(nodeId, key, data),
        isEditing: props.resumeIsEditing && isSelected,
        isSelected: isSelected,

        // Generate unique IDs for component
        id: nodeId,
        isLast: index === props.numSiblings - 1
    } as ResumeNodeProps;

    let Container: typeof React.Component;
    switch (props.type) {
        case DescriptionList.type:
            Container = DescriptionList;
            break;
        case DescriptionListItem.type:
            Container = DescriptionListItem;
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
                    resumeIsEditing: props.resumeIsEditing,
                    isSelected: props.selectedUuid === elem.uuid,
                    isSelectBlocked: props.isSelectBlocked,
                    hoverOver: props.hoverOver,
                    hoverOut: props.hoverOut,
                    updateSelected: props.updateSelected,
                    updateResumeData: props.updateResumeData,
                    selectedUuid: props.selectedUuid,

                    index: idx,
                    numSiblings: arr.length,

                    // Crucial for generating IDs so hover/select works properly
                    parentId: newProps.id
                };

                return <ResumeComponent key={uniqueId} {...childProps} />
            })
        }

        return <Container {...newProps}>
            {children}
        </Container>
    }

    return <React.Fragment></React.Fragment>
}