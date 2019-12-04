import * as React from "react";
import ReactQuill from 'react-quill';
import EditButton, { DeleteButton, DownButton, UpButton } from "./Buttons";
import ResumeComponent from "./ResumeComponent";
import { ButtonGroup } from "react-bootstrap";

export default class Paragraph extends ResumeComponent {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };

        this.updateDataEvent = this.updateDataEvent.bind(this);
    }

    get className(): string {
        let classNames = [super.className];
        if (this.state.isSelected) {
            classNames.push('flex-col');
        }

        return classNames.join(' ');
    }

    static quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            [{ 'align': [] }],
            ['clean']
        ],
    };

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

    render(): JSX.Element {
        let value = this.props.isEditing ? <ReactQuill
            modules={Paragraph.quillModules}
            value={this.props.value}
            onChange={((this.props.updateData as (key: string, data: any) => void).bind(this, "value") as (data: any) => void)}
        /> : <span dangerouslySetInnerHTML={{ __html: this.props.value as string }} />;

        return <div className={this.className} {...this.getSelectTriggerProps()}>
            {this.renderEditingMenu()}
            {value}
        </div>;
    }
}