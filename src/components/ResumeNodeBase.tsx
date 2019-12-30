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
    updateData: (id: IdType, key: string, data: NodeProperty) => void;
    updateSelected: (id?: IdType) => void;
    selectedUuid?: string;
}

export interface ResumeNodeProps extends ResumePassProps {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    isEditing: boolean;
    isLast: boolean;
    isSelected: boolean;
}

// Represents a node that is part of the user's resume
export default class ResumeNodeBase<P
    extends ResumeNodeProps=ResumeNodeProps> extends React.PureComponent<P> {
    constructor(props: P) {
        super(props);
        this.updateData = this.updateData.bind(this);
    }

    /** Returns true if this node has no children */
    get isEmpty(): boolean {
        const children = this.props.childNodes as Array<object>;
        if (children) {
            return children.length === 0;
        }

        return true;
    }

    get isEditing() {
        return this.props.isEditing && this.props.isSelected;
    }

    /**
     * Returns true if we are directly hovering over one of this node's children.
     * The purpose of this is to avoid selecting multiple nodes at once.
     */
    get isSelectBlocked(): boolean {
        return this.props.isSelectBlocked(this.props.id);
    }
    
    /** Returns props which make a text input responsive to clicks and keyboard 
     * events */
    get textFieldProps() {
        return {
            displayProcessor: process,
            isEditing: this.props.isEditing
        };
    }

    updateData(key: string, data: NodeProperty) {
        this.props.updateData(this.props.id, key, data);
    }
}