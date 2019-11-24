import * as React from "react";
import ReactQuill from 'react-quill';
import EditButton, { DeleteButton } from "./Buttons";
import ResumeComponent, { Action } from "./ResumeComponent";

import 'react-quill/dist/quill.snow.css';

export default class Paragraph extends ResumeComponent {
    constructor(props) {
        super(props);
        this.updateData = this.updateData.bind(this);
    }

    render(): JSX.Element {
        let modules = {
            toolbar: [
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                ['link'],
                ['clean']
            ],
        };

        if (this.props.isEditing) {
            return <React.Fragment>
                <ReactQuill
                    modules={modules}
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