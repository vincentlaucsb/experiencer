import * as React from "react";
import * as Helpers from "./Helpers";
import ResumeNodeBase, { ResumeNodeProps, Action } from "./ResumeNodeBase";
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

    setSelected() {
        // this.props.isSelectBlocked prevents a node from being selected if we are directly hovering
        // over one of its child nodes

        if (!this.isSelected && !this.isSelectBlocked) {
            // Unselect the previous component
            this.props.unselect();

            // Pass this node's unselect back up to <Resume />
            this.props.updateSelected({
                type: this.props['type'],
                id: this.props.id,
                uuid: this.props.uuid,
                addChild: this.props.addChild,
                deleteChild: this.props.deleteChild,
                moveUp: this.moveUp.bind(this),
                moveDown: this.moveDown.bind(this),
                getData: this.getData,
                toggleEdit: this.toggleEdit as Action,
                customOptions: [
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
                ]
            });
        }
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