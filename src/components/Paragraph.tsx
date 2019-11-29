import * as React from "react";
import ReactQuill from 'react-quill';
import EditButton, { DeleteButton } from "./Buttons";
import ResumeComponent from "./ResumeComponent";

export default class Paragraph extends ResumeComponent {
    constructor(props) {
        super(props);
        this.updateDataEvent = this.updateDataEvent.bind(this);
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
        return <span style={{ display: "inline-block" }}>
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
        </span>
    }

    render(): JSX.Element {
        let value = this.props.isEditing ? <ReactQuill
            modules={Paragraph.quillModules}
            value={this.props.value}
            onChange={((this.props.updateData as (key: string, data: any) => void).bind(this, "value") as (data: any) => void)}
        /> : <span dangerouslySetInnerHTML={{ __html: this.props.value as string }} />;

        return <div>
            {value}            
            {this.renderEditingMenu()}
        </div>;
    }
}