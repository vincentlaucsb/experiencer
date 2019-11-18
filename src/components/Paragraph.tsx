import Editable, { EditableProps } from "./Editable";
import React = require("react");
import EditButton from "./EditButton";

export interface ParagraphProps extends EditableProps {
    value?: string;
}

export default class Paragraph extends React.Component<ParagraphProps> {
    constructor(props) {
        super(props);

        this.updateData = this.updateData.bind(this);
    }

    // Convert newlines ('\n') into HTML line breaks
    processTextArea() : JSX.Element {
        let textArea = this.props.value.split("\n");

        return <React.Fragment>
            {textArea.map((x, idx) => <React.Fragment key={idx}>{x}<br /></React.Fragment>)}
            </React.Fragment>;
    }

    updateData(key: string, event: any) {
        this.props.updateData(key, event.target.value);
    }

    render(): JSX.Element {
        if (this.props.isEditing) {
            return <React.Fragment>
                <textarea onChange={this.updateData.bind(this, "value")} value={this.props.value} />
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