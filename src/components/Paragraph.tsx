import * as React from "react";
import * as Helpers from "./Helpers";
import ReactQuill from 'react-quill';
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import { IdType } from "./utility/HoverTracker";

interface ParagraphProps extends ResumeNodeProps {
    disableLineBreaks?: boolean;
}

export default class Paragraph extends ResumeNodeBase<ParagraphProps> {
    constructor(props) {
        super(props);

        this.disableLineBreaks = this.disableLineBreaks.bind(this);
    }

    get className(): string {
        let classNames = [super.className];
        if (this.isSelected) {
            classNames.push('flex-col');
        }

        if (this.props.disableLineBreaks) {
            classNames.push('text-inline');
        }

        return classNames.join(' ');
    }

    get customMenuOptions() {
        return [
            {
                text: 'Disable Line Breaks',
                action: this.disableLineBreaks
            }
        ];
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

    disableLineBreaks() {
        this.updateData('disableLineBreaks', true);
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
        const textValue = Paragraph.process(this.props.value) as string || "Empty text";

        let value = this.props.isEditing ? <ReactQuill
            modules={Paragraph.quillModules}
            value={this.props.value || ""}
            onChange={((this.props.updateData as (id: IdType, key: string, data: any) => void).bind(this, this.props.id, "value") as (data: any) => void)}
        /> : <span className="resume-paragraph" dangerouslySetInnerHTML={{ __html: textValue }} />;

        return <div className={this.className} {...this.selectTriggerProps}>
            {value}
        </div>;
    }
}