import * as React from "react";
import { EditorMode } from "./ResumeComponent";
import { process } from "./Helpers";
import { IdType } from "./utility/HoverTracker";
import ResumeComponent from "./ResumeComponent";
import { ResumeNode } from "./utility/NodeTree";

export type Action = (() => void);
export type ModifyChild = (id: IdType) => void;
export type AddChild = ((id: IdType, node: ResumeNode) => void);
export type NodeProperty = string | string[] | boolean | number | number[];

/** Represents resume prop properties and methods passed
 *  from the top down
 * */
export interface ResumePassProps extends ResumeNode {
    mode: EditorMode;
    hoverOver: (id: IdType) => void;
    hoverOut: (id: IdType) => void;
    isSelectBlocked: (id: IdType) => boolean;
    updateData: (id: IdType, key: string, data: NodeProperty) => void;
    updateSelected: (id?: IdType) => void;
}

export interface ResumeNodeProps extends ResumePassProps {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    isEditing: boolean;
    isLast: boolean;

    selectedUuid?: string;
    isHidden?: boolean;
}

// Represents a node that is part of the user's resume
export default class ResumeNodeBase<P
    extends ResumeNodeProps=ResumeNodeProps> extends React.PureComponent<P> {
    constructor(props: P) {
        super(props);
        this.updateData = this.updateData.bind(this);
    }

    static get flexRowStyle(): React.CSSProperties {
        return {
            display: 'flex',
            flexDirection: 'row'
        }
    }

    /** Get the class name for the main container */
    get className(): string {
        let classes = new Array<string>();
        if (this.isSelected) {
            classes.push('resume-selected');
        }

        return classes.join(' ');
    }

    /** Returns true if this node has no children */
    get isEmpty(): boolean {
        const children = this.props.children as Array<object>;
        if (children) {
            return children.length === 0;
        }

        return true;
    }

    get isEditing() {
        return this.props.isEditing && this.isSelected;
    }

    get isSelected(): boolean {
        return this.props.selectedUuid === this.props.uuid;
    }

    /**
     * Returns true if we are directly hovering over one of this node's children.
     * The purpose of this is to avoid selecting multiple nodes at once.
     */
    get isSelectBlocked(): boolean {
        return this.props.isSelectBlocked(this.props.id);
    }

    /** Returns hover/select trigger props */
    get selectTriggerProps() {
        return {
            onClick: (event: React.MouseEvent) => {
                // isSelectBlocked prevents us from selecting a parent
                // node
                if (!this.isSelected && !this.isSelectBlocked) {
                    this.props.updateSelected(this.props.id);
                    event.stopPropagation();
                }
            },
            onMouseEnter: () => {
                this.props.hoverOver(this.props.id);
            },
            onMouseLeave: () => {
                this.props.hoverOut(this.props.id);
            }
        };
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
    
    renderChildren() {
        const children = this.props.children as Array<ResumeNode>;
        if (children) {
            return children.map((elem: ResumeNode, idx: number, arr: ResumeNode[]) => {
                    const uniqueId = elem.uuid;
                    const props = {
                        ...elem,
                        mode: this.props.mode,
                        isEditing: this.props.isEditing,
                        isSelectBlocked: this.props.isSelectBlocked,
                        hoverOver: this.props.hoverOver,
                        hoverOut: this.props.hoverOut,
                        updateData: this.props.updateData,
                        updateSelected: this.props.updateSelected,
                        selectedUuid: this.props.selectedUuid,

                        index: idx,
                        numSiblings: arr.length,

                        // Crucial for generating IDs so hover/select works properly
                        parentId: this.props.id
                    };

                    return <ResumeComponent key={uniqueId} {...props} />
                })
        }
        
        return <React.Fragment />
    }
}