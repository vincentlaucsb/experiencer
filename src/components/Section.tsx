import * as React from "react";
import loadComponent from "./LoadComponent";
import EditButton from "./EditButton";
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
            <button onClick={this.addChild}>Add</button>
            <EditButton {...this.props} />
            <button onClick={this.props.deleteChild as Action}>Delete</button>
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

            {this.props.children.map((elem, idx) =>
                <React.Fragment key={idx}>
                    {loadComponent(elem,
                        {
                            addChild: this.addNestedChild.bind(this, idx),
                            toggleEdit: this.toggleNestedEdit.bind(this, idx),
                            updateData: this.updateNestedData.bind(this, idx)
                        })
                    }
                </React.Fragment>)
            }
        </section>;
    }
}