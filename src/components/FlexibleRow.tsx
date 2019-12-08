import * as React from "react";
import ResumeComponent from "./ResumeComponent";
import { ButtonGroup, Dropdown, DropdownButton, Button } from "react-bootstrap";
import { DeleteButton, UpButton, DownButton, AddButton } from "./Buttons";

export class FlexibleColumn extends ResumeComponent {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };
    }

    get className(): string {
        const position = ((this.props.id.split('-')).slice(-1))[0];
        let positionClsName = 'column-' + position;

        return [positionClsName, 'flex-col', super.className].join(' ');
    }

    getEditingMenu() {
        if (this.state.isSelected) {
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

    render() {
        return <div {...this.getSelectTriggerProps()} className={this.className} style={{ minWidth: "100px", minHeight: "100px" }}>
            {this.renderEditingMenu()}
            <div>
                {this.renderChildren()}
            </div>
        </div>
    }
}

export default class FlexibleRow extends ResumeComponent {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };

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
        if (this.state.isSelected) {
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
        if (this.state.isHovering) {
            return <div className="row-grab-handle-container">
                <div className="row-grab-handle" />
            </div>
        }

        return <></>
    }
    
    render() {
        return <div {...this.getSelectTriggerProps()}>
            {this.renderEditingMenu()}
            <div className={this.className} style={{ width: "100%", minWidth: "100px", minHeight: "100px" }}>
                {this.renderGrabHandle()}
                {this.renderChildren()}
            </div>
        </div>
    }
}