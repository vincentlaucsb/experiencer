import * as React from "react";
import { EditorMode } from "./ResumeComponent";
import { deleteAt, moveUp, moveDown, deepCopy, assignIds } from "./Helpers";
import { IdType } from "./utility/HoverTracker";
import ResumeComponent from "./ResumeComponent";

export interface BasicNodeProps {
    id: IdType;   // Hierarchical ID based on the node's position in the resume; subject to change
    uuid: string; // Unique ID that never changes

    addChild?: AddChild;
    deleteChild: Action;
    toggleEdit?: Action;
}

export interface SelectedNodeProps extends BasicNodeProps {
    getData: () => object;
}

/** Represents resume prop properties and methods passed
 *  from the top down
 * */
export interface ResumePassProps {
    uuid: string;
    mode: EditorMode;

    deleteChild: Action;
    hoverOver: (id: IdType) => void;
    hoverOut: (id: IdType) => void;
    isHovering: (id: IdType) => boolean;
    isSelected: (id: string) => boolean;
    isSelectBlocked: (id: IdType) => boolean;
    moveUp: Action;
    moveDown: Action;
    unselect: Action;
    updateData: (key: string, data: any) => void;
    updateSelected: (data?: SelectedNodeProps) => void;

    addChild?: AddChild;
    toggleEdit?: Action;
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

export type Action = (() => void);
export type AddChild = ((node: object) => void);
export type UpdateChild = ((key: string, data: any) => void);

// Represents a node that is part of the user's resume
export default class ResumeNodeBase<P
    extends ResumeNodeProps=ResumeNodeProps> extends React.PureComponent<P> {
    constructor(props: P) {
        super(props);
        
        this.addDescriptionList = this.addDescriptionList.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.addList = this.addList.bind(this);
        this.addParagraph = this.addParagraph.bind(this);
        this.addSection = this.addSection.bind(this);

        this.addChild = this.addChild.bind(this);
        this.getData = this.getData.bind(this);
        this.updateDataEvent = this.updateDataEvent.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.deleteNestedChild = this.deleteNestedChild.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleNestedEdit = this.toggleNestedEdit.bind(this);
        this.toggleHidden = this.toggleHidden.bind(this);
        this.updateNestedData = this.updateNestedData.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }

    /** Get the class name for the main container */
    get className(): string {
        let classes = new Array<string>();

        if (!this.isPrinting) {
            if (this.displayBorder) {
                classes.push('resume-hovering');
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

    get displayBorder(): boolean {
        const isExcepted = ['FlexibleColumn', 'FlexibleRow'].indexOf(this.props['type']) >= 0;
        return this.isHovering && (!this.isSelectBlocked || isExcepted);
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

    componentWillUnmount() {
        // Since the node is being deleted, remove callback to this node's unselect
        // method from <Resume /> to prevent memory leaks
        if (this.isSelected) {
            // NOTE: This can cause issues if an item is unmounted because it has 
            // been vastly modified via render() but not deleted from the resume,
            // i.e. unselect functionality will not work correctly.
            //
            // When that starts happening, either make render() not return vastly 
            // different structures in different scenarios or refactor the select/unselect
            // system to handle this by keeping unselect() bindings fresh
            this.props.updateSelected(undefined);

            // Remove self from set of active hover IDs
            this.props.hoverOut(this.props.id);
        }
    }

    addChild(node: object) {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)(node);
        }
    }

    addParagraph() {
        this.addChild({
            type: "Paragraph",
            value: "Enter value here"
        });
    }

    addEntry() {
        this.addChild({
            type: "Entry"
        });
    }

    addDescriptionList() {
        this.addChild({
            type: 'DescriptionList',
            children: [{
                type: 'DescriptionListItem'
            }]
        });
    }

    addList() {
        this.addChild({
            type: 'List',
            children: [{
                type: 'ListItem'
            }]
        });
    }

    addSection() {
        this.addChild({
            type: 'Section'
        })
    }

    /**
     * Add a grandchild node to this component
     * @param idx  The parent of the node to be added (where the parent is a child of this component)
     * @param node JSON description of the node to be added
     */
    addNestedChild(idx: number, node: object) {
        let newChildren = this.props.children as Array<object>;
        if (!newChildren[idx]['children']) {
            newChildren[idx]['children'] = new Array<object>();
        }

        newChildren[idx]['children'].push(assignIds(node));
        this.updateData("children", newChildren);
    }

    /**
     * Delete a grandchild
     * @param idx       Index of the parent of the node to be deleted
     * @param gchildIdx Index of the grandchild to be deleted
     */
    deleteNestedChild(idx: number) {
        let replChildren = this.props.children as Array<object>;
        if (replChildren) {
            // Replace node's children with new list of children that excludes deleted node
            this.updateData("children", deleteAt(replChildren, idx));
        }
    }

    // TODO: Just copy it from this child's parent's data
    /** Return an object representation of this item's essential attributes */
    getData() {
        let data = {
            children: deepCopy(this.props.children as Array<object>)
        };

        for (let k in this.props) {
            if (typeof(this.props[k]) == "string") {
                data[k] = this.props[k];
            }
        }

        return data;
    }

    moveNestedChildUp(idx: number) {
        let replChildren = this.props.children as Array<object>;
        if (replChildren) {
            // Replace node's children with new list of children that excludes deleted node
            this.updateData("children", moveUp(replChildren, idx));
        }
    }

    moveNestedChildDown(idx: number) {
        let replChildren = this.props.children as Array<object>;
        if (replChildren) {
            // Replace node's children with new list of children that excludes deleted node
            this.updateData("children", moveDown(replChildren, idx));
        }
    }

    toggleEdit(event: any) {
        if (this.props.toggleEdit as Action) {
            (this.props.toggleEdit as Action)();
        }
    }

    toggleNestedEdit(idx: number) {
        let currentChildData = this.props.children[idx]['isEditing'];
        this.updateNestedData(idx, "isEditing", !currentChildData);
    }
    
    updateNestedData(idx: number, key: string, data: any) {
        let newChildren = this.props.children as Array<object>;
        newChildren[idx][key] = data;
        this.updateData("children", newChildren);
    }

    updateData(key: string, data: string | boolean | object | Array<any>) {
        this.props.updateData(key, data);
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
                    addChild: this.addNestedChild.bind(this, idx),
                    isHovering: this.props.isHovering,
                    isSelected: this.props.isSelected,
                    isSelectBlocked: this.props.isSelectBlocked,
                    hoverOver: this.props.hoverOver,
                    hoverOut: this.props.hoverOut,
                    moveDown: this.moveNestedChildDown.bind(this, idx),
                    moveUp: this.moveNestedChildUp.bind(this, idx),
                    deleteChild: this.deleteNestedChild.bind(this, idx),
                    toggleEdit: this.toggleNestedEdit.bind(this, idx),
                    updateData: this.updateNestedData.bind(this, idx),
                    unselect: this.props.unselect,
                    updateSelected: this.props.updateSelected,

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
        this.updateData('isHidden', !this.props.isHidden);
    }

    setSelected() {
        // this.props.isSelectBlocked prevents a node from being selected if we are directly hovering
        // over one of its child nodes

        if (!this.isSelected && !this.isSelectBlocked) {
            // Unselect the previous component
            this.props.unselect();
            
            // Pass this node's unselect back up to <Resume />
            this.props.updateSelected({
                id: this.props.id,
                uuid: this.props.uuid,
                addChild: this.addChild,
                deleteChild: this.props.deleteChild,
                getData: this.getData,
                toggleEdit: this.props.toggleEdit as Action
            });
        }
    }

    // Get the buttons for editing a menu
    getEditingMenu() : any {
        return <></>
    }

    // Actually render the editing controls after checking that
    // they should be rendered
    renderEditingMenu() {
        if (this.isEditable) {
            const menu = this.getEditingMenu();
            if (menu) {
                return this.getEditingMenu();
            }
        }

        return <></>
    }
}