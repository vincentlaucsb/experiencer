import * as React from "react";
import TextField from "./controls/inputs/TextField";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import Container from "./Container";

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

        return <Container {...this.props} className={this.className}>
            <dt>{term}</dt>
            <dd>{value}</dd>
        </Container>
    }
}

export default class DescriptionList extends ResumeNodeBase {
    static readonly type = 'Description List';

    render() {
        return <Container displayAs="dl" {...this.props} className={this.className}>
            {this.props.children}
        </Container>
    }
}