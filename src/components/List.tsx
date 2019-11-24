import * as React from "react";
import ResumeComponent, { AddChild, UpdateChild, Action } from "./ResumeComponent";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import { Button, ButtonGroup } from "react-bootstrap";

export class ListItem extends ResumeComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let value: any = this.props.value ? this.props.value : "";
        if (this.props.isEditing) {
            value = <input style={{ maxWidth: "100%" }}
                onChange={(this.updateData as UpdateChild).bind(this, "value")}
                value={this.props.value || ""} type="text" />;
        }

        return <li style={{ minHeight: "24px" }}>
            {value}

            <div style={{ float: "right" }}>
                <EditButton {...this.props} />
                <DeleteButton {...this.props} />
                <UpButton {...this.props} />
                <DownButton {...this.props} />
            </div>
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
        return <ul>
                {this.renderChildren()}
            <li className="list-options">
                <Button onClick={this.addChild} size="sm">Add Bullet</Button>
                <Button onClick={this.props.deleteChild as Action} size="sm" variant="danger">Delete List</Button>
            </li>
            </ul>
    }
}