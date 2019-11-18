import Editable, { EditableProps } from "./Editable";
import React = require("react");
import EditButton from "./EditButton";

export interface ParagraphProps extends EditableProps {
    value?: string;
}

export default class Paragraph extends Editable<ParagraphProps> {
    constructor(props) {
        super(props);

        this.state = {
            isEditing: false,
            value: props.value ? props.value : ""
        };
    }

    // Convert newlines ('\n') into HTML line breaks
    processTextArea() : JSX.Element {
        let textArea = this.state.value.split("\n");

        return <React.Fragment>
            {textArea.map((x, idx) => <React.Fragment key={idx}>{x}<br /></React.Fragment>)}
            </React.Fragment>;
    }

    render(): JSX.Element {
        if (this.state.isEditing) {
            return <React.Fragment>
                <textarea onChange={this.updateValue} value={this.state.value} />
                <EditButton parent={this} />
            </React.Fragment>;
        }

        return <p>
            {this.processTextArea()}
            <span style={{ display: "inline-block" }}>
                <EditButton parent={this} />
            </span></p>;
    }
}