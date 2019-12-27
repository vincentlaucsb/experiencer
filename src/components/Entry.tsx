import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import TextField from "./controls/inputs/TextField";
import { pushArray } from "./Helpers";
import { BasicResumeNode } from "./utility/NodeTree";

interface EntryBase {
    title?: string[];
    subtitle?: string[];

    /** Position of subtitle line breaks */
    subtitleBreaks?: number[];
}

export interface BasicEntryProps extends BasicResumeNode, EntryBase { };
export interface EntryProps extends ResumeNodeProps, EntryBase { };

export default class Entry extends ResumeNodeBase<EntryProps> {
    constructor(props) {
        super(props);

        this.addTitleField = this.addTitleField.bind(this);
        this.addSubtitleField = this.addSubtitleField.bind(this);
        this.removeTitleField = this.removeTitleField.bind(this);
        this.removeSubtitleField = this.removeSubtitleField.bind(this);
    }    

    static readonly type = 'Entry';

    get className() {
        return ['entry', super.className].join(' ');
    }

    get title() {
        return this.props.title || [];
    }

    set title(data: Array<string>) {
        this.updateData('title', data);
    }

    get subtitle() {
        return this.props.subtitle || [];
    }

    set subtitle(data: Array<string>) {
        this.updateData('subtitle', data);
    }

    addTitleField() {
        this.title = pushArray(this.title, "");
    }

    addSubtitleField() {
        this.subtitle = pushArray(this.subtitle, "");
    }

    removeTitleField() {
        this.title = this.title.slice(0, this.title.length - 1);
    }

   removeSubtitleField() {
        this.subtitle = this.subtitle.slice(0, this.subtitle.length - 1);
   }

    getFields(key: 'title' | 'subtitle') {
        const updater = (key: 'title' | 'subtitle', index: number, text: string) => {
            this.updateExtras(key, index, text);
        }

        const fields = this.props[key];
        if (fields) {
            return fields.map((text, index, arr) => {
                const isLast = index === arr.length - 1;
                let classNames = ['field', `field-${index}`];
                if (isLast && index !== 0) {
                    classNames.push('field-last');
                }
                else if (index > 0) {
                    classNames.push('field-middle');
                }

                /** Conditionally add line break */
                let lineBreak = <></>
                if (this.props.subtitleBreaks && this.props.subtitleBreaks.indexOf(index) >= 0) {
                    lineBreak = <hr style={{
                        flexBasis: "100%",
                        border: 0
                    }}/>
                }

                return <><TextField
                    displayClassName={classNames.join(' ')}
                    key={index}
                    editBlocked={!this.isSelected}
                    onChange={(data: string) => updater(key, index, data)}
                    value={text || ""}
                    defaultText="Enter a value"
                    {...this.textFieldProps}
                />
                    {lineBreak}
                    </>
            });
        }

        return <></>
    }

    updateExtras(key: 'title' | 'subtitle', idx: number, text: string) {
        let replTitle = this.props[key] || [];

        // Replace contents
        replTitle[idx] = text;
        this.updateData(key, replTitle);
    }
    
    render() {
        /** hgroup onclick stops event from bubbling up to resume */
        return (
            <div className={this.className} {...this.selectTriggerProps}>
                <hgroup onClick={(event) => {
                    if (this.isEditing) {
                        event.stopPropagation();
                    }
                }}>
                    <h3 className="title">{this.getFields('title')}</h3>
                    <h4 className="subtitle">{this.getFields('subtitle')}</h4>
                </hgroup>

                {this.renderChildren()}
            </div>
        );
    }
}