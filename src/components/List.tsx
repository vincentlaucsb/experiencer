import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process } from "./Helpers";
import ResumeNodeProps from "./ResumeNodeProps";

interface DescriptionItemProps extends ResumeNodeProps {
    term?: string;
}

export class DescriptionListItem extends React.PureComponent<DescriptionItemProps> {
    static readonly type = 'Description List Item';
    
    render() {
        const term = <TextField
            label="Term"
            onChange={this.props.updateData.bind(this, "term")}
            value={this.props.term}
            defaultText="Enter a term"
            displayProcessor={process}
        />

        const value = <TextField
            label="Value"
            onChange={this.props.updateData.bind(this, "value")}
            value={this.props.value || ""}
            defaultText="Enter a value"
            displayProcessor={process}
        />

        return <Container {...this.props} className="resume-definition">
            <dt>{term}</dt>
            <dd>{value}</dd>
        </Container>
    }
}

export default class DescriptionList extends React.PureComponent<ResumeNodeProps> {
    static readonly type = 'Description List';

    render() {
        return <Container displayAs="dl" {...this.props}>
            {this.props.children}
        </Container>
    }
}