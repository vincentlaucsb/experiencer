import * as React from "react";
import ResumeComponent, { ResumeComponentProps, SelectedComponentProps, Action } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";
import { Nonprintable } from "./Nonprintable";
import { ButtonGroup, Button, Dropdown, DropdownButton } from "react-bootstrap";
import AddIcon from "../icons/add-24px.svg";
import { DropdownDivider } from "react-bootstrap/Dropdown";

export interface EntryProps extends ResumeComponentProps {
    title?: string[];
    subtitle?: string[];
}

interface EntryState {
    isHovering: boolean;
    isSelected: boolean;
}

export default class Entry extends ResumeComponent<EntryProps, EntryState> {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };

        this.addTitleField = this.addTitleField.bind(this);
        this.setSelected = this.setSelected.bind(this);
    }

    addTitleField() {
        let replTitle = this.props.title || [];
        replTitle.push("");

        console.log(replTitle);

        this.updateData('title', replTitle);
    }

    setSelected() {
        if (!this.state.isSelected) {
            this.setState({ isSelected: true });
            if (this.props.unselect as Action) {
                (this.props.unselect as Action)();
            }
            (this.props.updateSelected as (data: SelectedComponentProps) => void)({
                unselect: this.unselect.bind(this)
            });
        }
    }

    unselect() {
        this.setState({
            isSelected: false
        });
    }

    updateTitle(idx: number, event: any) {
        let replTitle = this.props.title || [];

        // Replace contents
        replTitle[idx] = event.target.value;

        console.log(replTitle, event);
        this.updateData('title', replTitle);
    }
    
    render() {
        let buttons = <></>
        let className = 'resume-entry';
        const titleData = this.props.title as string[];

        let subtitle: any = this.props.subtitle || "Enter a subtitle";
        let title: any = "Enter a title";

        if (this.props.isEditing) {
            if (titleData) {
                title = titleData.map((text, index) =>
                    <input key={index} onChange={this.updateTitle.bind(this, index)} value={text || ""} />
                );
            }
            else {
                title = <input onChange={this.updateTitle.bind(this, 0)} value="" />;
            }

            subtitle = <input onChange={this.updateDataEvent.bind(this, "subtitle")} value={this.props.subtitle || ""} />
        } else if (titleData) {
            title = titleData.map((text, index) => <span key={index}>{text}</span>);
        }

        if (!this.props.isPrinting) {
            if ((this.state.isHovering || this.state.isSelected)) {
                className += ' resume-selected';
            }

            if (this.state.isSelected) {
                buttons = <ButtonGroup size="sm">
                    <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                        <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                        <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={this.addTitleField}>Add another title field</Dropdown.Item>
                        <Dropdown.Item>Add another subtitle field</Dropdown.Item>
                    </DropdownButton>
                    <EditButton {...this.props} extended={true} />
                    <DeleteButton {...this.props} extended={true} />
                    <UpButton {...this.props} extended={true} />
                    <DownButton {...this.props} extended={true} />
                </ButtonGroup>
            }
        }

        return <div className={className}>
            {buttons}
            <h3 className="flex-row" onClick={this.setSelected}
                onMouseEnter={() => this.setState({ isHovering: true })}
                onMouseLeave={() => this.setState({ isHovering: false })}
            >
                {title}
            </h3>
            <p className="flex-row subtitle">{subtitle}</p>

            {this.renderChildren()}
        </div>
    }
}