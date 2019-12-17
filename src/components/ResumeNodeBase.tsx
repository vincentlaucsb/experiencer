import * as React from "react";
import { EditorMode } from "./ResumeComponent";
import { deepCopy } from "./Helpers";
import { IdType } from "./utility/HoverTracker";
import ResumeComponent from "./ResumeComponent";

export type Action = (() => void);
export type ModifyChild = (id: IdType) => void;
export type AddChild = ((id: IdType, node: object) => void);
export type UpdateChild = ((id: IdType, key: string, data: any) => void);

export interface NodeActions {
    addChild?: AddChild;
    deleteChild: ModifyChild;
    toggleEdit: ModifyChild;
}

export interface BasicNodeProps extends NodeActions {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    uuid: string; // Unique ID that never changes
}

/** Represents resume prop properties and methods passed
 *  from the top down
 * */
export interface ResumePassProps extends NodeActions {
    uuid: string;
    mode: EditorMode;

    hoverOver: (id: IdType) => void;
    hoverOut: (id: IdType) => void;
    isHovering: (id: IdType) => boolean;
    isSelected: (id: string) => boolean;
    isSelectBlocked: (id: IdType) => boolean;
    moveUp: ModifyChild;
    moveDown: ModifyChild;
    updateData: (id: IdType, key: string, data: any) => void;
    updateSelected: (id?: IdType) => void;
    updateCustomOptions: (options: CustomToolbarOptions) => void;
}

export interface ResumeNodeProps extends BasicNodeProps, ResumePassProps {
    isFirst: boolean;
    isLast: boolean;

    // TODO: Might wanna rename this property
    children?: Array<object>;
    isHidden?: boolean;
    isEditing?: boolean
    value?: string;
}

export interface ToolbarOption {
    text: string;
    action: Action;
}

export type CustomToolbarOptions = Array<ToolbarOption>;

// Represents a node that is part of the user's resume
export default class ResumeNodeBase<P
    extends ResumeNodeProps=ResumeNodeProps> extends React.PureComponent<P> {
    constructor(props: P) {
        super(props);
        
        this.addChild = this.addChild.bind(this);
        this.updateData = this.updateData.bind(this);
        this.updateDataEvent = this.updateDataEvent.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleHidden = this.toggleHidden.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }

    /** Get the class name for the main container */
    get className(): string {
        let classes = new Array<string>();

        if (!this.isPrinting) {
            if (this.isHovering) {
                classes.push('resume-hovering');

                if (this.isSelectBlocked) {
                    classes.push('resume-hovering-over-children');
                }
                else {
                    classes.push('resume-hovering-over-self');
                }
            }

            if (this.isSelected) {
                classes.push('resume-selected');
            }
        }

        if (this.props.isHidden) {
            classes.push('resume-hidden');
        }

        return classes.join(' ');
    }
    
    get customToolbarOptions() : CustomToolbarOptions {
        return [];
    }

    /** Returns true if this node has no children */
    get isEmpty(): boolean {
        const children = this.props.children as Array<object>;
        if (children) {
            return children.length === 0;
        }

        return true;
    }

    get isHovering(): boolean {
        return this.props.isHovering(this.props.id) && !this.isPrinting;
    }

    /** Prevent component from being edited from the template changing screen */
    get isEditable(): boolean {
        return !this.isPrinting && !(this.props.mode === 'changingTemplate');
    }

    get isPrinting() : boolean {
        return this.props.mode === 'printing';
    }

    get isSelected(): boolean {
        return this.props.isSelected(this.props.uuid);
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
            onClick: this.setSelected,
            onMouseEnter: () => this.props.hoverOver(this.props.id),
            onMouseLeave: () => this.props.hoverOut(this.props.id)
        };
    }

    toggleEdit() {
        this.props.toggleEdit(this.props.id);
    }

    addChild(node: object) {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)(this.props.id, node);
        }
    }
    
    updateData(key: string, data: string | boolean | object | Array<any>) {
        this.props.updateData(this.props.id, key, data);
    }

    updateDataEvent(key: string, event: any) {
        this.updateData(key, event.target.value);
    }

    renderChildren() {
        const children = this.props.children as Array<object>;
        if (children) {
            return children.map((elem: object, idx: number, arr: object[]) => {
                const uniqueId = elem['uuid'];
                const props = {
                    ...elem,
                    uuid: uniqueId,
                    mode: this.props.mode,
                    addChild: this.props.addChild,
                    isHovering: this.props.isHovering,
                    isSelected: this.props.isSelected,
                    isSelectBlocked: this.props.isSelectBlocked,
                    hoverOver: this.props.hoverOver,
                    hoverOut: this.props.hoverOut,
                    moveDown: this.props.moveDown,
                    moveUp: this.props.moveUp,
                    deleteChild: this.props.deleteChild,
                    toggleEdit: this.props.toggleEdit,
                    updateData: this.props.updateData,
                    updateSelected: this.props.updateSelected,
                    updateCustomOptions: this.props.updateCustomOptions,

                    index: idx,
                    numChildren: arr.length,

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
        // this.props.isSelectBlocked prevents a node from being selected if we are directly hovering
        // over one of its child nodes

        if (!this.isSelected && !this.isSelectBlocked) {
            // Pass this node's unselect back up to <Resume />
            this.props.updateSelected(this.props.id);
        }
    }
}