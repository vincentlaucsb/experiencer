﻿import * as React from "react";
import { EditorMode } from "./ResumeComponent";
import { process } from "./Helpers";
import { IdType } from "./utility/HoverTracker";
import ResumeComponent from "./ResumeComponent";
import { ResumeNode } from "./utility/NodeTree";
import ReactDOM from "react-dom";

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
    toggleEdit: ModifyChild;
    updateData: (id: IdType, key: string, data: NodeProperty) => void;
    updateSelected: (id?: IdType) => void;
}

export interface ResumeNodeProps extends ResumePassProps {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    isLast: boolean;

    selectedUuid?: string;
    isHidden?: boolean;
    isEditing?: boolean;
}

// Represents a node that is part of the user's resume
export default class ResumeNodeBase<P
    extends ResumeNodeProps=ResumeNodeProps> extends React.PureComponent<P> {
    ref = React.createRef<HTMLDivElement>();

    constructor(props: P) {
        super(props);
        
        this.updateData = this.updateData.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleHidden = this.toggleHidden.bind(this);
        this.setSelected = this.setSelected.bind(this);
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
        if (this.props.isHidden) {
            classes.push('resume-hidden');
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
        return this.props.isEditing; // && this.isSelected;
    }

    /** Prevent component from being edited from the template changing screen */
    get isEditable(): boolean {
        return !this.isPrinting && !(this.props.mode === 'changingTemplate');
    }

    get isPrinting() : boolean {
        return this.props.mode === 'printing';
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
        if (!this.isEditable) {
            return {};
        }

        return {
            onClick: (event: React.MouseEvent<any>) => {
                this.setSelected();
                event.stopPropagation();
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
            isEditing: this.props.isEditing, // && this.isSelected,
            onClick: this.toggleEdit, // this.isSelected ? this.toggleEdit : undefined,
            onEnterDown: this.toggleEdit
        };
    }
    
    toggleEdit() {
        this.props.toggleEdit(this.props.id);
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
                        isSelectBlocked: this.props.isSelectBlocked,
                        hoverOver: this.props.hoverOver,
                        hoverOut: this.props.hoverOut,
                        toggleEdit: this.props.toggleEdit,
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

    toggleHidden() {
        this.props.updateData(this.props.id, 'isHidden', !this.props.isHidden);
    }

    setSelected() {
        // !this.isSelectBlocked prevents a node from being selected if we are directly hovering
        // over one of its child nodes
        if (!this.isSelected && !this.isSelectBlocked) {
            // Pass this node's unselect back up to <Resume />
            this.props.updateSelected(this.props.id);
        }
    }
}