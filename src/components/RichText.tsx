import * as React from "react";
import * as Helpers from "./Helpers";
import ResumeNodeBase from "./ResumeNodeBase";
import QuillEditor from "./controls/inputs/QuillEditor";
import Container, { selectTriggerProps } from "./Container";

export default class RichText extends ResumeNodeBase {    
    static readonly type = 'Rich Text';

    get className() {
        return ['rich-text',
            this.props.classNames, super.className].join(' ');
    }
    
    render(): JSX.Element {
        const textValue = Helpers.process(this.props.value) as string || "Empty text";
        
        if (this.isEditing) {
            return (
                <Container className={this.className} {...this.props}>
                <QuillEditor
                    id={this.props.uuid}
                    value={this.props.value || ""}
                    className={this.className}
                    htmlId={this.props.htmlId}
                    onChange={(value) => this.props.updateData(this.props.id, "value", value)}
                    />
                </Container>
            );
        }

        return <div className={this.className}
            id={this.props.htmlId}
            {...selectTriggerProps(this.props)}
            dangerouslySetInnerHTML={{ __html: textValue }} />
    }
}