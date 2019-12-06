import * as React from "react";
import EditButton, { DeleteButton, UpButton, DownButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";
import { ButtonGroup, DropdownButton, Dropdown } from "react-bootstrap";

export interface HeaderProps extends ResumeComponentProps {
    orientation?: 'row' | 'column';
}

export default class Header extends ResumeComponent<HeaderProps> {
    constructor(props: ResumeComponentProps) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        }

        this.orientColumn = this.orientColumn.bind(this);
        this.orientRow = this.orientRow.bind(this);
    }

    get className(): string {
        let classNames = [super.className];

        if (this.props.orientation == 'row') {
            classNames.push('flex-row flex-spread');
        } else {
            classNames.push('flex-col');
        }

        return classNames.join(' ');
    }

    orientColumn() {
        this.updateData('orientation', 'column');
    }

    orientRow() {
        this.updateData('orientation', 'row');
    }

    getEditingMenu() {
        if (this.state.isSelected) {
            return <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Distribute Items" id="distribute-options" size="sm">
                    <Dropdown.Item onClick={this.orientColumn}>Top-to-bottom (column)</Dropdown.Item>
                    <Dropdown.Item onClick={this.orientRow}>Left-to-right (row)</Dropdown.Item>
                </DropdownButton>
                <EditButton {...this.props} extended={true} />
                <DeleteButton {...this.props} extended={true} />
                <UpButton {...this.props} extended={true} />
                <DownButton {...this.props} extended={true} />
            </ButtonGroup>
        }
    }

    render() {
        let value = this.props.isEditing ? <input onChange={this.updateDataEvent.bind(this, "value")}
            value={this.props.value} type="text" /> : this.props.value || "Enter a title";

        return <header className={this.className}>
            {this.renderEditingMenu()}
            <h1 {...this.getSelectTriggerProps()}>
                {value}
            </h1>
            {this.renderChildren()}
        </header>;
    }
}