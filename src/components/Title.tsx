import * as React from "react";
import { EditableProps } from "./Editable";
import EditButton from "./Buttons";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";

export default class Title extends ResumeComponent {
    constructor(props: ResumeComponentProps) {
        super(props);
    }

    render() {
        let value = this.props.isEditing ? <input onChange={this.updateDataEvent.bind(this, "value")}
            value={this.props.value} type="text" /> : this.props.value || "Enter a title";

        let buttons = !this.props.isPrinting ? <div style={{ display: "inline-block" }}>
            <EditButton {...this.props} />
        </div> : <></>;

        return <h1>
            {value}
            {buttons}
        </h1>;
    }
}