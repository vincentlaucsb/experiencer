import * as React from "react";
import EditButton, { DeleteButton, AddButton, DownButton, UpButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps, AddChild, Action } from "./ResumeComponent";
import { Dropdown, ButtonGroup, Button, DropdownButton } from "react-bootstrap";
import RotateLeft from "../icons/rotate_left-24px.svg";
import RotateRight from "../icons/rotate_right-24px.svg";
import Placeholder from "./Placeholder";

export type SectionHeaderPosition = "left" | "top";

export interface SectionProps extends ResumeComponentProps {
    title: string;
    headerPosition?: SectionHeaderPosition;
}

export default class Section extends ResumeComponent<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };

        this.rotateLeft = this.rotateLeft.bind(this);
        this.rotateRight = this.rotateRight.bind(this);
    }

    getEditingMenu() {
        let rotateButton = <Button onClick={this.rotateLeft}><img src={RotateLeft} alt="Place header on left" />Place Header on Left</Button>
        if (this.props.headerPosition == 'left') {
            rotateButton = <Button onClick={this.rotateRight}>
                <img src={RotateRight} alt="Place header on right" />Place Header on Top
            </Button>
        }

        if (this.state.isSelected) {
            return <ButtonGroup size="sm">
                <DropdownButton as={ButtonGroup} title="Add" id="add-options" size="sm">
                    <Dropdown.Item onClick={this.addEntry}>Entry</Dropdown.Item>
                    <Dropdown.Item onClick={this.addList}>Bulleted List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addDescriptionList}>Description List</Dropdown.Item>
                    <Dropdown.Item onClick={this.addParagraph}>Paragraph</Dropdown.Item>
                </DropdownButton>
                <EditButton {...this.props} extended={true} />
                <DeleteButton {...this.props} extended={true} />
                <UpButton {...this.props} extended={true} />
                <DownButton {...this.props} extended={true} />
                {rotateButton}
            </ButtonGroup>
        }
    }
    
    rotateLeft() {
        this.updateData('headerPosition', 'left');
    }

    rotateRight() {
        this.updateData('headerPosition', 'top');
    }

    get sectionClassName(): string {
        let classNames = [this.className];
        classNames.push(this.props.headerPosition == 'left' ? 'flex-row' : '');
        return classNames.join(' ');
    }

    get h2ClassName(): string {
        return this.props.headerPosition == 'left' ? 'flex-col' : 'flex-row flex-spread';
    }

    render() {
        let title = <Placeholder text={this.props.title} alt="Add a title" />

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} type="text" value={this.props.title || ""} />;
        }

        return <>
            <section className={this.sectionClassName} {...this.getSelectTriggerProps()}>
                {this.renderEditingMenu()}
                <h2 className={this.h2ClassName}>
                    {title}
                </h2>
                <div className="entry-content">
                    {this.renderChildren()}
                </div>
            </section>
        </>
    }
}