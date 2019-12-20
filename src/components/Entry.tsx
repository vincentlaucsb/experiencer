import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import ResumeTextField from "./controls/inputs/TextField";
import { pushArray } from "./Helpers";
import { BasicResumeNode } from "./utility/NodeTree";

interface EntryBase {
    title?: string[];
    subtitle?: string[];
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

    /** Get the class name for the main <div> container */
    get className(): string {
        let classes = ['entry', super.className];
        return classes.join(' ');
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
                if (isLast) {
                    classNames.push('field-last');
                }

                return <ResumeTextField
                    displayClassName={classNames.join(' ')}
                    key={index}
                    onChange={(data: string) => updater(key, index, data)}
                    value={text || ""}
                    label="Field"
                    defaultText="Enter a value"
                    {...this.textFieldProps}
                />
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
        return (
            <div className={this.className} {...this.selectTriggerProps}>
                <hgroup>
                    <h3 className="title">{this.getFields('title')}</h3>
                    <h4 className="subtitle">{this.getFields('subtitle')}</h4>
                </hgroup>

                {this.renderChildren()}
            </div>
        );
    }
}