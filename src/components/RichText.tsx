﻿import * as React from "react";
import ReactQuill from 'react-quill';

import * as Helpers from "./Helpers";
import ResumeNodeBase from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";
import QuillToolbar from "./controls/QuillToolbar";
import QuillEditor from "./controls/QuillEditor";

export default class RichText extends ResumeNodeBase {
    static quillModules = {
        toolbar: [
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image'],
            [{ 'align': [] }],
            ['clean']
        ],
    };

    static readonly type = 'Rich Text';

    get className() {
        return ['rich-text',
            this.props.classNames, super.className].join(' ');
    }
    
    render(): JSX.Element {
        const textValue = Helpers.process(this.props.value) as string || "Empty text";
        
        if (this.isEditing) {
            return (
                <div className={this.className} id={this.props.htmlId} {...this.selectTriggerProps}>
                <QuillEditor
                    id={this.props.uuid}
                    value={this.props.value || ""}
                    className={this.className}
                    htmlId={this.props.htmlId}
                    onChange={(value) => this.props.updateData(this.props.id, "value", value)}
                    />
                </div>
            );
        }

        return <div className={this.className} id={this.props.htmlId}
            {...this.selectTriggerProps}
            dangerouslySetInnerHTML={{ __html: textValue }} />
    }
}