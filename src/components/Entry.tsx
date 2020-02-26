import * as React from "react";
import TextField from "./controls/inputs/TextField";
import Container from "./Container";
import { process, deleteAt, toUrl } from "./Helpers";
import ResumeComponentProps, { BasicResumeNode } from "./utility/Types";
import ResumeContext from "./ResumeContext";

interface EntryBase {
    title?: string[];
    subtitle?: string[];

    /** Position of subtitle line breaks */
    subtitleBreaks?: number[];
}

export interface BasicEntryProps extends BasicResumeNode, EntryBase { };
export interface EntryProps extends ResumeComponentProps, EntryBase { };

export default class Entry extends React.PureComponent<EntryProps> {
    static contextType = ResumeContext;
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
        const value = this.context;
        const isSelected = value.selectedUuid === this.props.uuid;

        const deleter = (key: 'title' | 'subtitle', index: number) => {
            let arr = this.props[key] || [];
            this.props.updateData(key, deleteAt(arr, index));
        }

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

                const textFieldOptions = [
                    {
                        text: 'Delete',
                        action: () => deleter(key, index)
                    }
                ];

                return <React.Fragment key={`${index}/${arr.length}`}>
                    <TextField
                        displayClassName={this.getFieldClassName(index, arr)}
                        static={!isSelected}
                        onChange={(data: string) => updater(key, index, data)}
                        value={text || ""}
                        defaultText="Enter a value"
                        displayProcessors={[process, toUrl]}
                        contextMenuOptions={textFieldOptions}
                    />
                    {lineBreak}
                </React.Fragment>
            });
        }

        return <></>
    }

    render() {
        const isEditing = this.context.isEditingSelected && this.context.selectedUuid === this.props.uuid;

        /** hgroup onclick stops event from bubbling up to resume */
        return (
            <Container {...this.props} className="entry">
                <hgroup onClick={(event) => {
                    if (isEditing) {
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