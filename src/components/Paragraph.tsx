import * as React from "react";
import * as Helpers from "./Helpers";
import ReactQuill from 'react-quill';
import ResumeNodeBase from "./ResumeNodeBase";
import { ButtonGroup } from "react-bootstrap";
import { IdType } from "./utility/HoverTracker";

export default class Paragraph extends ResumeNodeBase {
    constructor(props) {
        super(props);

        this.updateDataEvent = this.updateDataEvent.bind(this);
    }

    get className(): string {
        let classNames = [super.className];
        if (this.isSelected) {
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

    /**
     * Perform helpful text processing
     * @param text Text to be processed
     */
    static process(text?: string) {
        return Helpers.process(text);
    }

    render(): JSX.Element {
        let value = this.props.isEditing ? <ReactQuill
            modules={Paragraph.quillModules}
            value={this.props.value}
            onChange={((this.props.updateData as (id: IdType, key: string, data: any) => void).bind(this, this.props.id, "value") as (data: any) => void)}
        /> : <span className="resume-paragraph" dangerouslySetInnerHTML={{ __html: Paragraph.process(this.props.value) as string }} />;

        return <div className={this.className} {...this.selectTriggerProps}>
            {value}
        </div>;
    }
}