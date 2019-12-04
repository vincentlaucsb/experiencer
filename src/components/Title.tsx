import * as React from "react";
import EditButton, { DeleteButton, UpButton, DownButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";
import { ButtonGroup } from "react-bootstrap";

export default class Title extends ResumeComponent {
    constructor(props: ResumeComponentProps) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        }
    }

    get className(): string {
        let classNames = [super.className];

        if (this.state.isSelected) {
            classNames.push('flex-col');
        }

        return classNames.join(' ');
    }

    getEditingMenu() {
        if (this.state.isSelected) {
            return <ButtonGroup size="sm">
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

        return <h1 className={this.className} {...this.getSelectTriggerProps()}>
            {this.renderEditingMenu()}
            {value}
        </h1>;
    }
}