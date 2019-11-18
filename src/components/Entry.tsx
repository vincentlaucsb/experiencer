import * as React from "react";
import { EditableProps } from "./Editable";
import loadComponent from "./LoadComponent";

export interface EntryProps extends EditableProps {
    children?: Array<object>;
    title?: string;
    subtitle?: string;
}

export default class Entry extends React.Component<EntryProps> {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.props.addChild({
            type: 'List'
        });
    }

    updateData(key: string, event: any) {
        this.props.updateData(key, event.target.value);
    }

    addNestedChild(idx: number, node: object) {
        let newChildren = this.props.children;
        if (!newChildren[idx]['children']) {
            newChildren[idx]['children'] = new Array<object>();
        }

        newChildren[idx]['children'].push(node);
        this.props.updateData("children", newChildren);
    }

    toggleNestedEdit(idx: number) {
        let currentChildData = this.props.children[idx]['isEditing'];
        this.updateNestedData(idx, "isEditing", !currentChildData);
    }

    updateNestedData(idx: number, key: string, data: any) {
        let newChildren = this.props.children;
        newChildren[idx][key] = data;
        this.props.updateData("children", newChildren);
    }

    render() {
        if (this.props.isEditing) {
            return <div>
                <input onChange={this.updateData.bind(this, "title")} value={this.props.title || ""} />
                <input onChange={this.updateData.bind(this, "subtitle")} value={this.props.subtitle || ""} />
                <button onClick={this.props.toggleEdit}>Done</button>
            </div>
        }

        return <div>
            <h3>{this.props.title || "Enter a title"}</h3>
            <p>{this.props.subtitle || "Enter a subtitle"}</p>

            {this.props.children.map((elem, idx) =>
                <React.Fragment key={idx}>
                    {loadComponent(elem,
                        {
                            addChild: this.addNestedChild.bind(this, idx),
                            toggleEdit: this.toggleNestedEdit.bind(this, idx),
                            updateData: this.updateNestedData.bind(this, idx)
                        })
                    }
                </React.Fragment>)}

            <button onClick={this.addChild}>Add</button>
            <button onClick={this.props.toggleEdit}>Edit</button>
        </div>
    }
}