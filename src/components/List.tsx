import * as React from "react";
import Editable, { EditableProps } from "./Editable";
import loadComponent from "./LoadComponent";

export interface ListItemProps extends EditableProps {
    value?: string;
}

export class ListItem extends React.Component<ListItemProps> {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.isEditing) {
            return <React.Fragment>
                <input onChange={this.props.updateData.bind(this, "value")} value={this.props.value} type="text" />
                <div style={{ float: "right" }}><button onClick={this.props.toggleEdit}>Done</button></div>
            </React.Fragment>
        }

        return <li>
            {this.props.value}
            <div style={{ float: "right" }}><button onClick={this.props.toggleEdit}>Edit</button></div>
        </li>
    }
}

export interface ListProps extends EditableProps {
    children?: any;
}

export default class List extends React.Component<ListProps> {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.props.addChild({
            type: 'ListItem'
        });
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
        return <React.Fragment>
            <div style={{ float: "right" }}>
                <button onClick={this.addChild}>Add</button>
            </div>
            <ul>
                {this.props.children.map((elem, idx) =>
                    <React.Fragment key={idx}>
                        {loadComponent(elem,
                            {
                                toggleEdit: this.toggleNestedEdit.bind(this, idx),
                                updateData: this.updateNestedData.bind(this, idx)
                            })
                        }
                    </React.Fragment>)
                }
            </ul>
            </React.Fragment>
    }
}