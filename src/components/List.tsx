import * as React from "react";
import ResumeComponent, { AddChild, UpdateChild } from "./ResumeComponent";
import EditButton, { DeleteButton } from "./Buttons";
import { Button } from "react-bootstrap";

export class ListItem extends ResumeComponent {
    constructor(props) {
        super(props);
    }

    render() {
        let value: any = this.props.value ? this.props.value : "";
        if (this.props.isEditing) {
            value = <input onChange={(this.updateData as UpdateChild).bind(this, "value")}
                value={this.props.value || ""} type="text" />;
        }

        return <li>
            {value}
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
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
            <li>
                <Button onClick={this.addChild}>Add a Bullet</Button>
                <DeleteButton {...this.props} />
            </li>
            </ul>
    }
}