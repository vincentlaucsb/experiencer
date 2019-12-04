import * as React from "react";
import ResumeComponent from "./ResumeComponent";
import { ButtonGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { DeleteButton, UpButton, DownButton } from "./Buttons";

export default class FlexibleRow extends ResumeComponent {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };
    }

    get className(): string {
        return ['flex-row-spread', super.className].join(' ');
    }

    getEditingMenu() {
        if (this.state.isSelected) {
            return <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                    <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addDescriptionList}>Description List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
                </DropdownButton>
                <DeleteButton {...this.props} extended={true} />
                <UpButton {...this.props} extended={true} />
                <DownButton {...this.props} extended={true} />
            </ButtonGroup>
        }
    }
    
    render() {
        return <div {...this.getSelectTriggerProps()}>
            {this.renderEditingMenu()}
            <div className={this.className} style={{ width: "100%" }}>
                {this.renderChildren()}
            </div>
        </div>
    }
}