import * as React from "react";
import EditButton, { DeleteButton, AddButton } from "./Buttons";
import ResumeComponent, { ResumeComponentProps, AddChild, Action } from "./ResumeComponent";

export interface SectionProps extends ResumeComponentProps {
    title: string;
}

export default class Section extends ResumeComponent<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: "Paragraph",
                value: "Enter value here"
            });
        }
    }

    render() {
        let buttons = <div style={{ float: "right" }}>
            <AddButton action={this.addChild} />
            <EditButton {...this.props} />
            <DeleteButton action={(this.props.deleteChild as Action)} />
        </div>

        let title: string | JSX.Element = this.props.title;

        if (this.props.isEditing) {
            title = <input onChange={this.updateData.bind(this, "title")} type="text" value={this.props.title} />;
        }
        
        return <section>
            <h2>
                {title}
                {buttons}
            </h2>

            {this.renderChildren()}
        </section>;
    }
}