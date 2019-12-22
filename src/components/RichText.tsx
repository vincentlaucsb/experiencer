import * as React from "react";
import ReactQuill from 'react-quill';

import * as Helpers from "./Helpers";
import ResumeNodeBase from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";

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
                <>
                    <div style={{
                        position: "relative",
                        background: "black",
                        height: 0,
                        top: "-40px"
                    }}>
                        <div id="quill-toolbar" style={{ position: "absolute" }} {...this.selectTriggerProps}>
                            <span className="ql-formats">
                                <button className="ql-bold" type="button"></button>
                                <button className="ql-italic" type="button"></button>
                                <button className="ql-underline" type="button"></button>
                                <button className="ql-strike" type="button"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-list" type="button" value="ordered"></button>
                                <button className="ql-list" type="button" value="bullet"></button>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-link" type="button"></button>
                                <button className="ql-image" type="button"></button>
                            </span>
                            <span className="ql-formats">
                                <span className="ql-align ql-picker ql-icon-picker"></span>
                                <select className="ql-align" style={{ display: "none" }}></select>
                            </span>
                            <span className="ql-formats">
                                <button className="ql-clean" type="button"></button>
                            </span>
                        </div>
                    </div>
                    <div className={this.className} id={this.props.htmlId} {...this.selectTriggerProps}>
                    <ReactQuill
                        modules={{ toolbar: "#quill-toolbar" }}
                        value={this.props.value || ""}
                        onChange={this.props.updateData.bind(this, this.props.id, "value")}
                    />
                    </div>
                </>
            );
        }

        return <div className={this.className} id={this.props.htmlId}
            {...this.selectTriggerProps}
            dangerouslySetInnerHTML={{ __html: textValue }} />
    }
}