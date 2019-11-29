import * as React from "react";
import ResumeComponent, { ResumeComponentProps, SelectedComponentProps, Action } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";
import { Nonprintable } from "./Nonprintable";
import { ButtonGroup, Button, Dropdown, DropdownButton } from "react-bootstrap";
import AddIcon from "../icons/add-24px.svg";

export interface EntryProps extends ResumeComponentProps {
    title?: string;
    titleRight?: string;
    subtitle?: string;
    subtitleRight?: string;
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

        this.setSelected = this.setSelected.bind(this);
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
    
    render() {
        let buttons = <></>
        let className = 'resume-entry';

        let title: any = this.props.title || "Enter a title";
        let titleRight: any = this.props.titleRight || "";
        let subtitle: any = this.props.subtitle || "Enter a subtitle";
        let subtitleRight: any = this.props.subtitleRight || "";

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} value={this.props.title || ""} />
            titleRight = <input onChange={this.updateDataEvent.bind(this, "titleRight")} value={this.props.titleRight || ""} />
            subtitle = <input onChange={this.updateDataEvent.bind(this, "subtitle")} value={this.props.subtitle || ""} />
            subtitleRight = <input onChange={this.updateDataEvent.bind(this, "subtitleRight")} value={this.props.subtitleRight || ""} />
        }

        if (this.state.isHovering || this.state.isSelected) {
            className += ' resume-selected';
        }

        if (this.state.isSelected) {
            buttons = <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                    <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
                </DropdownButton>
                <EditButton {...this.props} extended={true} />
                <DeleteButton {...this.props} extended={true} />
                <UpButton {...this.props} extended={true} />
                <DownButton {...this.props} extended={true} />
            </ButtonGroup>
        }

        return <div className={className}>
            {buttons}
            <h3 className="flex-row" onClick={this.setSelected}
                onMouseEnter={() => this.setState({ isHovering: true })}
                onMouseLeave={() => this.setState({ isHovering: false })}
            >
                <span>{title}</span> <span className="title-right">{titleRight}</span>
            </h3>
            <p className="flex-row subtitle">{subtitle} <span className="subtitle-right">{subtitleRight}</span></p>

            {this.renderChildren()}
        </div>
    }
}