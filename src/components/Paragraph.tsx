import * as React from "react";
import ReactQuill from 'react-quill';
import EditButton, { DeleteButton } from "./Buttons";
import ResumeComponent, { Action } from "./ResumeComponent";

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

    render(): JSX.Element {
        if (this.props.isEditing) {
            return <React.Fragment>
                <ReactQuill
                    modules={Paragraph.quillModules}
                    value={this.props.value}
                    onChange={((this.props.updateData as (key: string, data: any) => void).bind(this, "value") as (data: any) => void)}
                />
                <EditButton {...this.props} />
            </React.Fragment>;
        }

        return <div>
            <div dangerouslySetInnerHTML={{ __html: this.props.value as string }} />
            <span style={{ display: "inline-block" }}>
                <EditButton {...this.props} />
                <DeleteButton {...this.props} />
            </span></div>;
    }
}