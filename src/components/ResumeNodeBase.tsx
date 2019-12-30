import * as React from "react";
import { process } from "./Helpers";
import { IdType } from "./utility/HoverTracker";
import { ResumeNode } from "./utility/NodeTree";

export type Action = (() => void);
export type ModifyChild = (id: IdType) => void;
export type AddChild = ((id: IdType, node: ResumeNode) => void);
export type NodeProperty = string | string[] | boolean | number | number[];

/** Represents resume prop properties and methods passed
 *  from the top down
 * */
export interface ResumePassProps extends ResumeNode {
    hoverOver: (id: IdType) => void;
    hoverOut: (id: IdType) => void;
    isSelectBlocked: (id: IdType) => boolean;
    updateSelected: (id?: IdType) => void;
    selectedUuid?: string;
}

/** Actual props which go into a resume component */
export interface ResumeNodeProps extends ResumePassProps {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    isEditing: boolean;
    isLast: boolean;
    isSelected: boolean;
    updateData: (key: string, data: NodeProperty) => void;
}

// Represents a node that is part of the user's resume
export default class ResumeNodeBase<P
    extends ResumeNodeProps=ResumeNodeProps> extends React.PureComponent<P> {
    constructor(props: P) {
        super(props);
    }
}