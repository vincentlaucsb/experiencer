import * as React from "react";
import * as Helpers from "./Helpers";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import EditButton, { DownButton, UpButton, DeleteButton } from "./controls/Buttons";
import { ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import Placeholder from "./Placeholder";

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

    getEditingMenu() {
        if (this.isSelected) {
            return <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                    <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addDescriptionList}>Description List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={this.addTitleField}>Add another title field</Dropdown.Item>
                    <Dropdown.Item onClick={this.addSubtitleField}>Add another subtitle field</Dropdown.Item>
                    <Dropdown.Item onClick={this.removeTitleField}>Remove title field (from right)</Dropdown.Item>
                    <Dropdown.Item onClick={this.removeSubtitleField}>Remove subtitle field (from right)</Dropdown.Item>
                </DropdownButton>
                <EditButton {...this.props} extended={true} />
                <DeleteButton {...this.props} extended={true} />
                <UpButton {...this.props} extended={true} />
                <DownButton {...this.props} extended={true} />
            </ButtonGroup>
        }
    }

    getExtras(key: string, updater: (idx: number, event: any) => void) {
        const extraData = this.props[key];
        if (extraData) {
            if (this.props.isEditing) {
                return extraData.map((text, index) =>
                    <input key={index} onChange={updater.bind(this, index)} value={text || ""} />
                );
            }

            return extraData.map((text, index) => <span key={index}>{Entry.process(text) || "Enter a value"}</span>);
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
        let title = <Placeholder text={Entry.process(this.props.title)} alt="Enter a title" />;
        let subtitle = <Placeholder text={Entry.process(this.props.subtitle)} alt="Enter a subtitle" />;

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} value={this.props.title || ""} />;
            subtitle = <input onChange={this.updateDataEvent.bind(this, "subtitle")} value={this.props.subtitle || ""} />
        }

        return <div className={this.className} {...this.selectTriggerProps}>
            {this.renderEditingMenu()}
            <div className="entry-title">
                <h3 className="flex-row flex-spread">{title} {this.getTitleExtras()}</h3>
                <p className="flex-row flex-spread subtitle">{subtitle} {this.getSubtitleExtras()}</p>
            </div>

            {this.renderChildren()}
        </div>
    }
}