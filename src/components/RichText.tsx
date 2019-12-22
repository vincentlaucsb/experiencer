import * as React from "react";
import ReactQuill from 'react-quill';

import * as Helpers from "./Helpers";
import ResumeNodeBase from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";
import QuillToolbar from "./controls/QuillToolbar";

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
        return super.className + ' rich-text';
    }
    
    get selectTriggerProps() {
        const baseProps = super.selectTriggerProps;

        // Click to edit
        if (this.isSelected && !this.props.isEditing) {
            baseProps.onClick = () => {
                this.setSelected();
                this.toggleEdit();
            }
        }

        return baseProps;
    }

    render(): JSX.Element {
        const textValue = Helpers.process(this.props.value) as string || "Empty text";
        
        if (this.isEditing) {
            return (
                <div>
                    <QuillToolbar selectTriggerProps={this.selectTriggerProps} />
                    <div className={this.className} id={this.props.htmlId} {...this.selectTriggerProps}>
                    <ReactQuill
                        modules={{ toolbar: "#quill-toolbar" }}
                        value={this.props.value || ""}
                        onChange={this.props.updateData.bind(this, this.props.id, "value")} />
                    </div>
                </div>
            );
        }

        return <div className={this.className} id={this.props.htmlId}
            {...this.selectTriggerProps}
            dangerouslySetInnerHTML={{ __html: textValue }} />
    }
}