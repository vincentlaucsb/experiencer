import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process, isEmpty } from "./Helpers";
import ResumeComponentProps from "./utility/Types";

/** Represents a section in a resume */
export default class Section extends React.PureComponent<ResumeComponentProps> {
    static readonly type = 'Section';
    
    render() {
        const title = <TextField
            onChange={this.props.updateData.bind(this, "value")}
            value={this.props.value || ''}
            label="Title"
            defaultText="Enter a title"
            displayProcessors={[process]}
        />

        let helperText = <></>
        if (isEmpty(this.props.children)) {
            helperText = <p>This section is empty. Click here to select it and add content.</p>
        }

        return (
            <Container displayAs="section" {...this.props}>
                <h2>{title}</h2>
                <div className="content">
                    {this.props.children}
                    {helperText}
                </div>
            </Container>
        );
    }
}