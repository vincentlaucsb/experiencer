import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process } from "./Helpers";
import ResumeNodeProps from "./ResumeNodeProps";
import { BasicResumeNode } from "./utility/Types";

interface EntryBase {
    title?: string[];
    subtitle?: string[];

    /** Position of subtitle line breaks */
    subtitleBreaks?: number[];
}

export interface BasicEntryProps extends BasicResumeNode, EntryBase { };
export interface EntryProps extends ResumeNodeProps, EntryBase { };

export default class Entry extends React.PureComponent<EntryProps> {
    static readonly type = 'Entry';

    /**
     * Generate the class name for the n-th field
     * @param index
     * @param arr
     */
    getFieldClassName(index: number, arr: string[]) {
        const isLast = index === arr.length - 1;
        let classNames = ['field', `field-${index}`];
        if (isLast && index !== 0) {
            classNames.push('field-last');
        }
        else if (index > 0) {
            classNames.push('field-middle');
        }

        return classNames.join(' ');
    }

    getFields(key: 'title' | 'subtitle') {
        const updater = (key: 'title' | 'subtitle', index: number, text: string) => {
            let replTitle = this.props[key] || [];

            // Replace contents
            replTitle[index] = text;
            this.props.updateData(key, replTitle);
        }

        const fields = this.props[key];
        if (fields) {
            return fields.map((text, index, arr) => {
                /** Conditionally add line break */
                let lineBreak = <></>
                if (this.props.subtitleBreaks && this.props.subtitleBreaks.indexOf(index) >= 0) {
                    lineBreak = <hr style={{
                        flexBasis: "100%",
                        border: 0
                    }}/>
                }

                return <React.Fragment key={index}>
                    <TextField
                        displayClassName={this.getFieldClassName(index, arr)}
                        editBlocked={!this.props.isSelected}
                        onChange={(data: string) => updater(key, index, data)}
                        value={text || ""}
                        defaultText="Enter a value"
                        displayProcessor={process}
                    />
                    {lineBreak}
                </React.Fragment>
            });
        }

        return <></>
    }

    render() {
        /** hgroup onclick stops event from bubbling up to resume */
        return (
            <Container {...this.props} className="entry">
                <hgroup onClick={(event) => {
                    if (this.props.isEditing) {
                        event.stopPropagation();
                    }
                }}>
                    <h3 className="title">{this.getFields('title')}</h3>
                    <h4 className="subtitle">{this.getFields('subtitle')}</h4>
                </hgroup>

                {this.props.children}
            </Container>
        );
    }
}