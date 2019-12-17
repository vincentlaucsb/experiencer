import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import Placeholder from "./Placeholder";
import { DescriptionList } from "./List";
import ResumeTextField from "./controls/TextField";

export type SectionHeaderPosition = "left" | "top";

export interface SectionProps extends ResumeNodeProps {
    title: string;
    headerPosition?: SectionHeaderPosition;
}

/** Represents a section in a resume */
export default class Section extends ResumeNodeBase<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
    }
    
    get childTypes() {
        return ['Entry', 'Paragraph', 'Bulleted List',
            DescriptionList.name
        ];
    }

    get customMenuOptions() {
        const flipHeader = this.props.headerPosition === 'top' ? {
            text: 'Header on Left',
            action: this.rotateLeft
        } : {
                text: 'Header on Top',
                action: this.rotateRight
            };

        return [ flipHeader ];
    }
    
    rotateLeft() {
        this.updateData('headerPosition', 'left');
    }

    rotateRight() {
        this.updateData('headerPosition', 'top');
    }

    get sectionClassName(): string {
        let classNames = [this.className];
        classNames.push(this.props.headerPosition === 'left' ? 'flex-row' : '');
        return classNames.join(' ');
    }

    get h2ClassName(): string {
        return this.props.headerPosition === 'left' ? 'flex-col' : 'flex-row flex-spread';
    }

    render() {
        const title = <ResumeTextField
            onChange={this.updateData.bind(this, "title")}
            value={this.props.title}
            label="Title"
            defaultText="Enter a title"
            {...this.textFieldProps}
        />

        let helperText = <></>
        if (this.isEmpty && !this.isSelected) {
            helperText = <p>This section is empty. Click here to select it and add content.</p>
        }

        return <>
            <section className={this.sectionClassName} {...this.selectTriggerProps}>
                <h2 className={this.h2ClassName}>
                    {title}
                </h2>
                <div className="entry-content">
                    {this.renderChildren()}
                    {helperText}
                </div>
            </section>
        </>
    }
}