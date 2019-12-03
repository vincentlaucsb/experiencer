import * as React from "react";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps, AddChild, Action } from "./ResumeComponent";
import { Dropdown, ButtonGroup, Button } from "react-bootstrap";
import RotateLeft from "../icons/rotate_left-24px.svg";
import Placeholder from "./Placeholder";

export type SectionHeaderPosition = "left" | "top";

export interface SectionProps extends ResumeComponentProps {
    title: string;
    headerPosition?: SectionHeaderPosition;
}

export default class Section extends ResumeComponent<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.rotateLeft = this.rotateLeft.bind(this);
    }

    getEditingMenu() {
        let addMenu = <Dropdown style={{ fontFamily: "sans-serif", display: "inline" }}>
            <Dropdown.Toggle id="add" size="sm">
                Add
            </Dropdown.Toggle>
            <Dropdown.Menu>
                <Dropdown.Item onClick={this.addEntry}>Entry</Dropdown.Item>
                <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                <Dropdown.Item onClick={this.addDescriptionList}>Description List</Dropdown.Item>
                <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
            </Dropdown.Menu>
        </Dropdown>

        return <span>
            <EditButton {...this.props} />
            <img src={RotateLeft} onClick={this.rotateLeft} alt="Place header on left" />
            <DeleteButton {...this.props} />
            <UpButton {...this.props} />
            <DownButton {...this.props} />
            {addMenu}
        </span>
    }

    rotateLeft() {
        this.updateData('headerPosition', 'left');
    }

    get sectionClassName(): string {
        return this.props.headerPosition == 'left' ? 'flex-row' : '';
    }

    get h2ClassName(): string {
        return this.props.headerPosition == 'left' ? 'flex-col' : 'flex-row-spread';
    }

    render() {
        let title = <Placeholder text={this.props.title} alt="Add a title" />

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} type="text" value={this.props.title || ""} />;
        }

        return <section className={this.sectionClassName}>
            <h2 className={this.h2ClassName}>
                {title}
                {this.renderEditingMenu()}
            </h2>
            <div className="entry-content">
                {this.renderChildren()}
            </div>
        </section>
    }
}