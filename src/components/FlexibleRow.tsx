import * as React from "react";
import ResumeNodeBase from "./ResumeComponent";
import { ButtonGroup, Dropdown, DropdownButton, Button } from "react-bootstrap";
import { DeleteButton, UpButton, DownButton } from "./controls/Buttons";

export class FlexibleColumn extends ResumeNodeBase {
    /** Get the index of this column */
    get position(): number {
        return this.props.id[this.props.id.length - 1];
    }

    get className(): string {
        let positionClsName = 'column-' + this.position;
        return [positionClsName, 'flex-col', super.className].join(' ');
    }

    getEditingMenu() {
        if (this.isSelected) {
            return <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                    <Dropdown.Item onClick={this.addSection}>Section</Dropdown.Item>
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

    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.displayBorder && !this.isSelected) {
            return <div className="column-grab-handle-container">
                <div className="d-flex align-items-center column-grab-handle">
                    Click here to select column
                </div>
            </div>
        }

        return <></>
    }

    render() {
        let helperText = <></>;
        if (this.isEmpty && !this.isSelected) {
            helperText = <span>Column {this.position}: Click to select and add content</span>
        }

        return <div {...this.selectTriggerProps} className={this.className} style={{ minWidth: "100px", minHeight: "100px" }}>
            {this.renderEditingMenu()}
            <div>
                {this.renderGrabHandle()}
                {this.renderChildren()}
                {helperText}
            </div>
        </div>
    }
}

export default class FlexibleRow extends ResumeNodeBase {
    constructor(props) {
        super(props);

        this.addColumn = this.addColumn.bind(this);
    }

    get className(): string {
        return ['flex-row', 'flex-spread', super.className].join(' ');
    }

    addColumn() {
        this.addChild({
            type: 'FlexibleColumn'
        });
    }

    getEditingMenu() {
        if (this.isSelected) {
            return <ButtonGroup size="sm">
                <Button onClick={this.addColumn}>Add Column</Button>
                <DeleteButton {...this.props} extended={true} />
                <UpButton {...this.props} extended={true} />
                <DownButton {...this.props} extended={true} />
            </ButtonGroup>
        }
    }

    /** Returns a "handle" which can be used to select the row itself and not the columns it contains */
    renderGrabHandle() {
        if (this.displayBorder && !this.isSelected) {
            return <div className="row-grab-handle-container">
                <div className="d-flex align-items-center row-grab-handle">
                    Click here to select row
                </div>
            </div>
        }

        return <></>
    }
    
    render() {
        return <div {...this.selectTriggerProps}>
            {this.renderEditingMenu()}
            <div className={this.className} style={{ width: "100%", minWidth: "100px", minHeight: "100px" }}>
                {this.renderGrabHandle()}
                {this.renderChildren()}
            </div>
        </div>
    }
}