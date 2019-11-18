import * as React from "react";

export interface ResumeComponentProps {
    isEditing?: boolean;
    value?: string;
    children?: Array<object>;

    addChild?: ((idx: number, node: object) => void) | ((node: object) => void);
    deleteChild?: ((idx: number) => void) | (() => void);
    toggleEdit?: ((idx: number) => void) | (() => void);
    updateData?: ((idx: number, key: string, data: any) => void) | ((key: string, data: any) => void);
}

export type Action = (() => void);
export type AddChild = ((node: object) => void);

// Represents a component that is part of the user's resume
export default class ResumeComponent<
    P extends ResumeComponentProps=ResumeComponentProps, S = {}>
    extends React.Component<P, S> {
    constructor(props: P) {
        super(props);

        this.updateData = this.updateData.bind(this);
        this.addNestedChild = this.addNestedChild.bind(this);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.toggleNestedEdit = this.toggleNestedEdit.bind(this);
        this.updateNestedData = this.updateNestedData.bind(this);
    }

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
}