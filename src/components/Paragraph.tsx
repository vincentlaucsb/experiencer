import Editable, { EditableProps } from "./Editable";
import React = require("react");
import EditButton from "./EditButton";

export interface ParagraphProps extends EditableProps {
    value?: string;
}

export default class Paragraph extends React.Component<ParagraphProps> {
    constructor(props) {
        super(props);
    }

    // Convert newlines ('\n') into HTML line breaks
    processTextArea() : JSX.Element {
        let textArea = this.props.value.split("\n");

        return <React.Fragment>
            {textArea.map((x, idx) => <React.Fragment key={idx}>{x}<br /></React.Fragment>)}
            </React.Fragment>;
    }

    render(): JSX.Element {
        if (this.props.isEditing) {
            return <React.Fragment>
                <textarea onChange={this.props.updateData.bind(this, "value")} value={this.props.value} />
                <button onClick={this.props.toggleEdit}>Edit</button>
            </React.Fragment>;
        }

        return <p>
            {this.processTextArea()}
            <span style={{ display: "inline-block" }}>
                <button onClick={this.props.toggleEdit}>Edit</button>
            </span></p>;
    }
}