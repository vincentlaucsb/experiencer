import * as React from "react";
import * as Helpers from "./Helpers";
import QuillEditor from "./controls/inputs/QuillEditor";
import Container from "./Container";
import ResumeComponentProps from "./utility/Types";
import ResumeContext from "./ResumeContext";

export default class RichText extends React.PureComponent<ResumeComponentProps> {    
    static contextType = ResumeContext;
    static readonly type = 'Rich Text';

    render() {
        const isEditing = this.context.isEditingSelected && this.context.selectedUuid === this.props.uuid;
        const textValue = Helpers.process(this.props.value) as string || "Empty text";
        
        if (isEditing) {
            return (
                <Container className="rich-text" {...this.props}>
                <QuillEditor
                    id={this.props.uuid}
                    value={this.props.value || ""}
                    htmlId={this.props.htmlId}
                    onChange={(value) => this.props.updateData("value", value)}
                    />
                </Container>
            );
        }

        return <Container {...this.props} className="rich-text">
            <span dangerouslySetInnerHTML={{ __html: textValue }} />
        </Container>
    }
}