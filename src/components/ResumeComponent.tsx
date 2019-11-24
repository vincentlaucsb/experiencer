import * as React from "react";
import loadComponent from "./LoadComponent";
import { deleteAt, moveUp, moveDown } from "./Helpers";

export interface ResumeComponentProps {
    isEditing?: boolean;
    value?: string;
    children?: Array<object>;

    addChild?: ((idx: number, node: object) => void) | ((node: object) => void);
    moveUp?: ((idx: number) => void) | (() => void);
    moveDown?: ((idx: number) => void) | (() => void);
    deleteChild?: ((idx: number) => void) | (() => void);
    toggleEdit?: ((idx: number) => void) | (() => void);
    updateData?: ((idx: number, key: string, data: any) => void) | ((key: string, data: any) => void);
}

export type Action = (() => void);
export type AddChild = ((node: object) => void);
export type UpdateChild = ((key: string, data: any) => void);

// Represents a component that is part of the user's resume
export default class ResumeComponent<
    P extends ResumeComponentProps=ResumeComponentProps, S = {}>
    extends React.Component<P, S> {
    constructor(props: P) {
        super(props);

        this.addParagraph = this.addParagraph.bind(this);
        this.addEntry = this.addEntry.bind(this);
        this.addList = this.addList.bind(this);

        this.updateData = this.updateData.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.deleteNestedChild = this.deleteNestedChild.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleNestedEdit = this.toggleNestedEdit.bind(this);
        this.updateNestedData = this.updateNestedData.bind(this);
    }
    
    addChild(data: object) {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)(data);
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
            type: "Entry",
            title: "Enter value here",
            subtitle: "Enter value here"
        });
    }

    addList() {
        this.addChild({ type: 'List' });
    }

    /**
     * Add a grandchild node to this component
     * @param idx  The parent of the node to be added (where the parent is a child of this component)
     * @param node JSON description of the node to be added
     */
    addNestedChild(idx: number, node: object) {
        let newChildren = this.props.children;
        if (!newChildren[idx]['children']) {
            newChildren[idx]['children'] = new Array<object>();
        }

        newChildren[idx]['children'].push(node);

        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))("children", newChildren);
        }
    }

    /**
     * Delete a grandchild
     * @param idx       Index of the parent of the node to be deleted
     * @param gchildIdx Index of the grandchild to be deleted
     */
    deleteNestedChild(idx: number) {
        let replChildren = this.props.children;
        if (replChildren as Array<object>) {
           replChildren = deleteAt((replChildren as Array<object>), idx);
        }

        // Replace node's children with new list of children that excludes deleted node
        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))("children", replChildren);
        }
    }

    moveNestedChildUp(idx: number) {
        let replChildren = this.props.children;
        if (replChildren as Array<object>) {
            replChildren = moveUp((replChildren as Array<object>), idx);
        }

        // Replace node's children with new list of children that excludes deleted node
        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))("children", replChildren);
        }
    }

    moveNestedChildDown(idx: number) {
        let replChildren = this.props.children;
        if (replChildren as Array<object>) {
            replChildren = moveDown((replChildren as Array<object>), idx);
        }

        // Replace node's children with new list of children that excludes deleted node
        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))("children", replChildren);
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
        let newChildren = this.props.children;
        newChildren[idx][key] = data;
        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))("children", newChildren);
        }
    }

    updateData(key: string, event: any) {
        if (this.props.updateData as ((key: string, data: any) => void)) {
            (this.props.updateData as ((key: string, data: any) => void))(key, event.target.value);
        }
    }

    renderChildren() {
        if (this.props.children as Array<object>) {
            return <React.Fragment>{
                (this.props.children as Array<object>).map((elem, idx) =>
                    <React.Fragment key={idx}>
                        {loadComponent(elem,
                            {
                                addChild: (this.addNestedChild.bind(this, idx) as (node: object) => void),
                                moveDown: (this.moveNestedChildDown.bind(this, idx) as Action),
                                moveUp: (this.moveNestedChildUp.bind(this, idx) as Action),
                                deleteChild: (this.deleteNestedChild.bind(this, idx) as Action),
                                toggleEdit: (this.toggleNestedEdit.bind(this, idx) as () => void),
                                updateData: (this.updateNestedData.bind(this, idx) as (key: string, data: any) => void)
                            })
                        }
                    </React.Fragment>)
            }
            </React.Fragment>
        }

        return <React.Fragment />
    }
}