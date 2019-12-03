import * as React from "react";
import ResumeComponent, { ResumeComponentProps, SelectedComponentProps, Action } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";
import { ButtonGroup, Button, Dropdown, DropdownButton } from "react-bootstrap";

export interface EntryProps extends ResumeComponentProps {
    title?: string;
    titleExtras?: string[];
    subtitle?: string;
    subtitleExtras?: string[];
}

export default class Entry extends ResumeComponent<EntryProps> {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };

        this.addTitleField = this.addTitleField.bind(this);
        this.addSubtitleField = this.addSubtitleField.bind(this);
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

    getEditingMenu() {
        if (this.state.isSelected) {
            return <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                    <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addDescriptionList}>Description List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={this.addTitleField}>Add another title field</Dropdown.Item>
                    <Dropdown.Item onClick={this.addSubtitleField}>Add another subtitle field</Dropdown.Item>
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

            return extraData.map((text, index) => <span key={index}>{this.process(text) || "Enter a value"}</span>);
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

    process(text?: string) {
        if (text) {
            // Replace '--' with en dash and '---' with em dash
            return text.replace('--', '\u2013').replace('---', '\u2014');
        }

        return ""
    }
    
    render() {
        let className = 'entry';
        let title: any = this.process(this.props.title) || "Enter a title";
        let subtitle: any = this.process(this.props.subtitle) || "Enter a subtitle";

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} value={this.props.title || ""} />;
            subtitle = <input onChange={this.updateDataEvent.bind(this, "subtitle")} value={this.props.subtitle || ""} />
        }

        if (!this.isPrinting && (this.state.isHovering || this.state.isSelected)) {
            className += ' resume-selected';
        }

        return <div className={className}>
            {this.renderEditingMenu()}
            <div className="entry-title" {...this.getSelectTriggerProps()}>
                <h3 className="flex-row-spread">{title} {this.getTitleExtras()}</h3>
                <p className="flex-row-spread subtitle">{subtitle} {this.getSubtitleExtras()}</p>
            </div>

            {this.renderChildren()}
        </div>
    }
}