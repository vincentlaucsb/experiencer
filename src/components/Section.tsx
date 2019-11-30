import * as React from "react";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps, AddChild, Action } from "./ResumeComponent";
import { Dropdown, ButtonGroup, Button } from "react-bootstrap";
import RotateLeft from "../icons/rotate_left-24px.svg";

export interface SectionProps extends ResumeComponentProps {
    title: string;
    headerPosition?: "left" | "top";
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

    render() {
        let title: string | JSX.Element = this.props.title;

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} type="text" value={this.props.title} />;
        }
        
        if (this.props.headerPosition == 'left') {
            return <section className="flex-row">
                <h2 className="flex-col">
                    {title}
                    {this.renderEditingMenu()}
                </h2>
                <div className="entry-content">
                    {this.renderChildren()}
                </div>
            </section>
        }

        return <section>
            <h2 className="flex-row-spread">
                {title}
                {this.renderEditingMenu()}
            </h2>

            {this.renderChildren()}
        </section>
    }
}