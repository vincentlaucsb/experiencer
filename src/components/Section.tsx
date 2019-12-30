import * as React from "react";
import ResumeNodeBase from "./ResumeNodeBase";
import TextField from "./controls/inputs/TextField";

/** Represents a section in a resume */
export default class Section extends ResumeNodeBase {
    static readonly type = 'Section';
    
    render() {
        const title = <TextField
            onChange={this.updateData.bind(this, "value")}
            value={this.props.value || ''}
            label="Title"
            defaultText="Enter a title"
            {...this.textFieldProps}
        />

        let helperText = <></>
        if (this.isEmpty) {
            helperText = <p>This section is empty. Click here to select it and add content.</p>
        }

        return (
            <section className={this.className} id={this.props.htmlId} {...this.selectTriggerProps}>
                <h2>{title}</h2>
                <div className="content">
                    {this.props.children}
                    {helperText}
                </div>
            </section>
        );
    }
}