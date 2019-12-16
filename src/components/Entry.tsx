import * as React from "react";
import * as Helpers from "./Helpers";
import ResumeNodeBase, { ResumeNodeProps, Action } from "./ResumeNodeBase";
import ResumeTextField from "./controls/TextField";

export interface EntryProps extends ResumeNodeProps {
    title?: string;
    titleExtras?: string[];
    subtitle?: string;
    subtitleExtras?: string[];
}

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

    get customMenuOptions() {
        return [
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
            },
        ];
    }

    get textFieldProps() {
        return {
            displayProcessor: Entry.process,
            isEditing: this.props.isEditing,
            onClick: this.isSelected ? this.toggleEdit : undefined,
            onEnterDown: this.toggleEdit
        };
    }

    addTitleField() {
        let replTitle = this.props.titleExtras || [];
        replTitle.push("");
        this.updateData('titleExtras', replTitle);
    }

    addSubtitleField() {
        let replTitle = this.props.subtitleExtras || [];
        replTitle.push("");
        this.updateData('subtitleExtras', replTitle);
    }

    removeTitleField() {
        let replTitle = this.props.titleExtras || [];
        replTitle = replTitle.slice(0, replTitle.length - 1);
        this.updateData('titleExtras', replTitle);
    }

   removeSubtitleField() {
        let replTitle = this.props.subtitleExtras || [];
        replTitle = replTitle.slice(0, replTitle.length - 1);
        this.updateData('subtitleExtras', replTitle);
   }

    getExtras(key: string, updater: (idx: number, event: any) => void) {
        const extraData = this.props[key];
        if (extraData) {
            return extraData.map((text, index) =>
                <ResumeTextField
                    displayClassName="extra-field"
                    key={index}
                    onChange={updater.bind(this, index)}
                    value={text || ""}
                    label="Extra Field"
                    defaultText="Enter a value"
                    {...this.textFieldProps}
                />
            );
        }

        return <></>
    }

    getTitleExtras() {
        return this.getExtras('titleExtras', this.updateTitleExtras);
    }

    getSubtitleExtras() {
        return this.getExtras('subtitleExtras', this.updateSubtitleExtras);
    }

    updateExtras(key: string, idx: number, event: any) {
        let replTitle = this.props[key] || [];

        // Replace contents
        replTitle[idx] = event.target.value;
        this.updateData(key, replTitle);
    }

    updateTitleExtras(idx: number, event: any) {
        this.updateExtras('titleExtras', idx, event);
    }

    updateSubtitleExtras(idx: number, event: any) {
        this.updateExtras('subtitleExtras', idx, event);
    }

    /**
     * Perform helpful text processing
     * @param text Text to be processed
     */
    static process(text?: string) {
        return Helpers.process(text);
    }
    
    render() {
        const title = <ResumeTextField 
            displayClassName="title-text"
            onChange={this.updateData.bind(this, "title")}
            value={this.props.title}
            label="Title"
            defaultText="Enter a title"
            {...this.textFieldProps}
        />

        const subtitle = <ResumeTextField
            displayClassName="subtitle-text"
            onChange={this.updateData.bind(this, "subtitle")}
            value={this.props.subtitle}
            label="Subitle"
            defaultText="Enter a subtitle"
            {...this.textFieldProps}
        />

        return <div className={this.className} {...this.selectTriggerProps}>
            <div className="entry-title">
                <h3 className="flex-row flex-spread">{title} {this.getTitleExtras()}</h3>
                <p className="flex-row flex-spread subtitle">{subtitle} {this.getSubtitleExtras()}</p>
            </div>

            {this.renderChildren()}
        </div>
    }
}