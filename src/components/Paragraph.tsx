import * as React from "react";
import EditButton, { DeleteButton } from "./Buttons";
import ResumeComponent, { Action } from "./ResumeComponent";

export default class Paragraph extends ResumeComponent {
    constructor(props) {
        super(props);

        this.updateData = this.updateData.bind(this);
    }

    // Convert newlines ('\n') into HTML line breaks
    processTextArea() : JSX.Element {
        let textArea = (this.props.value as string).split("\n");

        return <React.Fragment>
            {textArea.map((x, idx) => <React.Fragment key={idx}>{x}<br /></React.Fragment>)}
            </React.Fragment>;
    }

    render(): JSX.Element {
        if (this.props.isEditing) {
            return <React.Fragment>
                <textarea onChange={this.updateData.bind(this, "value")} value={this.props.value} />
                <EditButton {...this.props} />
            </React.Fragment>;
        }

        return <p>
            {this.processTextArea()}
            <span style={{ display: "inline-block" }}>
                <EditButton {...this.props} />
                <DeleteButton action={this.props.deleteChild as Action} />
            </span></p>;
    }
}