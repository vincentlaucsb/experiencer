import * as React from "react";

import ResumeComponentProps, { IdType, NodeProperty, ResumeNode } from "@/types";

import ComponentTypes from "./schema/ComponentTypes";

interface FactoryProps extends ResumeNode {
    index: number;       // The n-th index of this node relative to its parent
    numSiblings: number; // Number of siblings this node has
    parentId?: IdType;   // The id of the parent node
    updateResumeData: (id: IdType, key: string, data: NodeProperty) => void
    updateResumeDataFields: (id: IdType, patch: Partial<Record<string, NodeProperty>>) => void
}

/**
 * This is used when loading a resume from JSON, where we need to convert the raw data into React components.
 * The factory takes care of recursively rendering the correct component for each node type, as well as passing
 * down the necessary props and generating unique IDs for each component instance.
 * By centralizing this logic in one place, we can ensure that all components are rendered consistently
 * and have access to the data and update functions they need.
 */
export default function ResumeComponentFactory(props: FactoryProps) {
    const parentId = props.parentId;
    const index = props.index;
    const nodeId = parentId ? [...parentId, index] : [index];

    let newProps = {
        ...props,

        // Compute properties
        updateData: (key, data) => props.updateResumeData(nodeId, key, data),
        updateDataFields: (patch) => props.updateResumeDataFields(nodeId, patch),

        // Generate unique IDs for component
        id: nodeId,
        isLast: index === props.numSiblings - 1
    } as ResumeComponentProps;

    console.log("Rendering node", props.type, "with props", newProps);

    const ResumeComponent = ComponentTypes.instance.getComponent(props.type);
    if (!ResumeComponent) 
        return <React.Fragment></React.Fragment>

    let children: React.ReactNode = <></>
    if (props.childNodes) {
        children = props.childNodes.map((elem, idx, arr) => {
            const uniqueId = elem.uuid;
            const childProps = {
                ...elem,
                updateResumeData: props.updateResumeData,
                updateResumeDataFields: props.updateResumeDataFields,

                index: idx,
                numSiblings: arr.length,

                // Crucial for generating IDs so hover/select works properly
                parentId: newProps.id
            };

            return <ResumeComponentFactory key={uniqueId} {...childProps} />
        })
    }

    return (
        <ResumeComponent {...newProps}>
            {children}
        </ResumeComponent>
    );
}