import * as React from "react";
import * as Helpers from "./Helpers";
import ResumeNodeBase from "./ResumeNodeBase";
import QuillEditor from "./controls/inputs/QuillEditor";
import Container from "./Container";

export default class RichText extends ResumeNodeBase {    
    static readonly type = 'Rich Text';
    
    render() {
        const textValue = Helpers.process(this.props.value) as string || "Empty text";
        
        if (this.props.isEditing) {
            return (
                <Container className="rich-text" {...this.props}>
                <QuillEditor
                    id={this.props.uuid}
                    value={this.props.value || ""}
                    htmlId={this.props.htmlId}
                    onChange={(value) => this.props.updateData(this.props.id, "value", value)}
                    />
                </Container>
            );
        }

        return <Container {...this.props} className="rich-text">
            <span dangerouslySetInnerHTML={{ __html: textValue }} />
        </Container>
    }
}