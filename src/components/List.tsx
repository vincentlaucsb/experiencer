import * as React from "react";
import 'react-contexify/dist/ReactContexify.min.css';
import Placeholder from "./Placeholder";
import ResumeTextField from "./controls/TextField";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import ResumeComponent from "./ResumeComponent";

interface DescriptionItemProps extends ResumeNodeProps {
    term?: string;
}

export class DescriptionListItem extends ResumeNodeBase<DescriptionItemProps> {
    get className() {
        return super.className + " resume-definition";
    }

    render() {
        let value: any = this.props.value || "";

        const term = <ResumeTextField
            label="Term"
            onChange={this.updateData.bind(this, "term") as (text: string) => void}
            value={this.props.term}
            defaultText="Enter a term"
        />

        /**
        if (this.props.isEditing) {
            value = <InputGroup size="sm">
                <Form.Control value={value}
                    onChange={this.updateDataEvent.bind(this, "value")}
                    placeholder="Value" />
                    </InputGroup>
        }
        **/

        return <div className={this.className} {...this.selectTriggerProps}>
            <dt>
                <span>{term}</span>
            </dt>
            <dd>
                <span className="flex-row">
                    <Placeholder text={value} />
                </span>
            </dd>
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

        return <ul className={this.className} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
        </ul>
    }
}