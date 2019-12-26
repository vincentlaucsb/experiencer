﻿import * as React from "react";
import 'react-contexify/dist/ReactContexify.min.css';
import ResumeTextField from "./controls/inputs/TextField";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";

interface DescriptionItemProps extends ResumeNodeProps {
    term?: string;
}

export class DescriptionListItem extends ResumeNodeBase<DescriptionItemProps> {
    static readonly type = 'DescriptionListItem';

    get className() {
        return super.className + " resume-definition";
    }

    render() {
        const term = <ResumeTextField
            label="Term"
            onChange={this.updateData.bind(this, "term")}
            value={this.props.term}
            defaultText="Enter a term"
            {...this.textFieldProps}
        />

        const value = <ResumeTextField
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
    static readonly type = 'DescriptionList';

    render() {
        if (this.props.isHidden && this.isPrinting) {
            return <></>
        }

        return <dl className={this.className} {...this.selectTriggerProps}>
            {this.renderChildren()}
        </dl>
    }
}