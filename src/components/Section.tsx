import * as React from "react";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps, AddChild, Action } from "./ResumeComponent";
import { Dropdown, ButtonGroup, Button } from "react-bootstrap";
import { Nonprintable } from "./Nonprintable";

export interface SectionProps extends ResumeComponentProps {
    title: string;
}

export default class Section extends ResumeComponent<SectionProps> {
    constructor(props: SectionProps) {
        super(props);
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
            <DeleteButton {...this.props} />
            <UpButton {...this.props} />
            <DownButton {...this.props} />
            {addMenu}
        </span>
    }

    render() {
        let title: string | JSX.Element = this.props.title;

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} type="text" value={this.props.title} />;
        }
        
        return <section>
            <h2 className="flex-row">
                {title}
                {this.renderEditingMenu()}
            </h2>

            {this.renderChildren()}
        </section>;
    }
}