import * as React from "react";
import loadComponent from "./LoadComponent";
import ResumeComponent, { AddChild } from "./ResumeComponent";

export class ListItem extends ResumeComponent {
    constructor(props) {
        super(props);
    }

    render() {
        if (this.props.isEditing) {
            return <React.Fragment>
                <input onChange={this.props.updateData.bind(this, "value")} value={this.props.value} type="text" />
                <div style={{ float: "right" }}><button onClick={this.toggleEdit}>Done</button></div>
            </React.Fragment>
        }

        return <li>
            {this.props.value}
            <div style={{ float: "right" }}><button onClick={this.toggleEdit}>Edit</button></div>
        </li>
    }
}

export default class List extends ResumeComponent {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'ListItem'
            });
        }
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