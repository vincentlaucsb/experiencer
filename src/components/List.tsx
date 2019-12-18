import * as React from "react";
import 'react-contexify/dist/ReactContexify.min.css';
import ResumeTextField from "./controls/TextField";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";

interface DescriptionItemProps extends ResumeNodeProps {
    term?: string;
}

export class DescriptionListItem extends ResumeNodeBase<DescriptionItemProps> {
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

export class DescriptionList extends ResumeNodeBase {
    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="column-grab-handle-container">
                <div className="column-grab-handle">
                    Click here to select description list
                </div>
            </div>
        }

        return <></>
    }

    render() {
        if (this.props.isHidden && this.isPrinting) {
            return <></>
        }

        return <dl className={this.className} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
        </dl>
    }
}