import * as React from "react";
import TextField from "./controls/inputs/TextField";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";

interface DescriptionItemProps extends ResumeNodeProps {
    term?: string;
}

export class DescriptionListItem extends ResumeNodeBase<DescriptionItemProps> {
    static readonly type = 'Description List Item';

    get className() {
        return super.className + " resume-definition";
    }

    render() {
        const term = <TextField
            label="Term"
            onChange={this.updateData.bind(this, "term")}
            value={this.props.term}
            defaultText="Enter a term"
            {...this.textFieldProps}
        />

        const value = <TextField
            label="Value"
            onChange={this.updateData.bind(this, "value")}
            value={this.props.value || ""}
            defaultText="Enter a value"
            {...this.textFieldProps}
        />

        return <div className={this.className} {...this.selectTriggerProps}>
            <dt>{term}</dt>
            <dd>{value}</dd>
        </div>
    }
}

export default class DescriptionList extends ResumeNodeBase {
    static readonly type = 'Description List';

    render() {
        return <dl className={this.className} {...this.selectTriggerProps}>
            {this.renderChildren()}
        </dl>
    }
}