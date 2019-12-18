import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps, Action, CustomToolbarOptions } from "./ResumeNodeBase";
import ResumeTextField from "./controls/TextField";
import ResumeWrapper from "./ResumeWrapper";
import { pushArray } from "./Helpers";
import { BasicResumeNode, ResumeNode } from "./utility/NodeTree";

interface EntryBase {
    title?: string[];
    subtitle?: string[];
}

export interface BasicEntryProps extends BasicResumeNode, EntryBase { };
interface EntryProps extends ResumeNodeProps, EntryBase { };

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

    get customToolbarOptions() : CustomToolbarOptions {
        return [
            {
                text: 'Title Options',
                actions: [
                    {
                        text: 'Add another title field',
                        action: this.addTitleField,
                    },
                    {
                        text: 'Add another subtitle field',
                        action: this.addSubtitleField,
                    },
                    {
                        text: 'Remove title field (from right)',
                        action: this.removeTitleField,
                    },
                    {
                        text: 'Remove subtitle field (from right)',
                        action: this.removeSubtitleField,
                    }
                ]
            }
        ];
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

    // TODO: Refactor this
    getExtras(key: string, updater: (idx: number, event: any) => void) {
        const extraData = this.props[key];
        if (extraData) {
            return extraData.map((text, index) =>
                <ResumeTextField
                    displayClassName="extra-field"
                    key={index}
                    onChange={updater.bind(this, index)}
                    value={text || ""}
                    label="Field"
                    defaultText="Enter a value"
                    {...this.textFieldProps}
                />
            );
        }

        return <></>
    }

    getTitleExtras() {
        return this.getExtras('title', this.updateTitleExtras);
    }

    getSubtitleExtras() {
        return this.getExtras('subtitle', this.updateSubtitleExtras);
    }

    updateExtras(key: string, idx: number, text: string) {
        let replTitle = this.props[key] || [];

        // Replace contents
        replTitle[idx] = text;
        this.updateData(key, replTitle);
    }

    updateTitleExtras(idx: number, text: string) {
        this.updateExtras('title', idx, text);
    }

    updateSubtitleExtras(idx: number, text: string) {
        this.updateExtras('subtitle', idx, text);
    }
    
    render() {
        return <ResumeWrapper
            customToolbar={this.customToolbarOptions}
            updateToolbar={this.props.updateCustomOptions}
            id={this.props.id} isSelected={this.isSelected}
            toggleEdit={this.toggleEdit}
            isEditing={this.props.isEditing}
        >
            <div className={this.className} {...this.selectTriggerProps}>
            <div className="entry-title">
                <h3 className="flex-row flex-spread">{this.getTitleExtras()}</h3>
                <p className="flex-row flex-spread subtitle">{this.getSubtitleExtras()}</p>
            </div>

            {this.renderChildren()}
            </div>
        </ResumeWrapper>
    }
}