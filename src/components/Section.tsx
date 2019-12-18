import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
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

    get className() {
        let classNames = [ super.className ];
        if (this.props.headerPosition === 'left') {
            classNames.push('header-left');
        }
        return classNames.join(' ');
    }

    get style() {
        if (this.props.headerPosition === 'left') {
            return ResumeNodeBase.flexRowStyle;
        }
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
            <section className={this.className} style={this.style} {...this.selectTriggerProps}>
                <h2>{title}</h2>
                <div className="entry-content">
                    {this.renderChildren()}
                    {helperText}
                </div>
            </section>
        </>
    }
}