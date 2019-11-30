import * as React from "react";
import EditButton, { DeleteButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";

export default class Title extends ResumeComponent {
    constructor(props: ResumeComponentProps) {
        super(props);
    }

    getEditingMenu() {
        return <div style={{ display: "inline-block", margin: "0.5rem" }}>
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
            </div>
    }

    render() {
        let value = this.props.isEditing ? <input onChange={this.updateDataEvent.bind(this, "value")}
            value={this.props.value} type="text" /> : this.props.value || "Enter a title";

        return <h1>
            {value}
            {this.renderEditingMenu()}
        </h1>;
    }
}