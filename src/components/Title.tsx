import * as React from "react";
import EditButton from "./Buttons";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";

export default class Title extends ResumeComponent {
    constructor(props: ResumeComponentProps) {
        super(props);
    }

    getEditingMenu() {
        return <EditButton {...this.props} />
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