import * as React from "react";
import { EditableBase } from "./Editable";

export class EditButtonProps {
    parent: EditableBase;
}

export default class EditButton extends React.Component<EditButtonProps> {
    constructor(props: EditButtonProps) {
        super(props);
    }

    render() {
        const isEditing = this.props.parent.state.isEditing;
        if (isEditing) {
            return <button onClick={this.props.parent.toggleEdit}>Done</button>
        }

        return <button onClick={this.props.parent.toggleEdit}>Edit</button>
    }
}