import * as React from "react";
import { EditableProps } from "./Editable";
import EditButton from "./Buttons";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";

export default class Title extends ResumeComponent {
    constructor(props: ResumeComponentProps) {
        super(props);
    }

    render() {
        if (this.props.isEditing) {
            return <React.Fragment>
                <input onChange={this.updateData.bind(this, "value")}
                    value={this.props.value} type="text" />
                <EditButton {...this.props} />
            </React.Fragment>;
        }

        return <h1>
            {this.props.value}
            <div style={{ display: "inline-block" }}>
                <EditButton {...this.props} />
            </div>
        </h1>;
    }
}