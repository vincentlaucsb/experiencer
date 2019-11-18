﻿import * as React from "react";
import ChildHolder from "./ChildHolder";
import Editable, { EditableState, EditableProps } from "./Editable";
import EditButton from "./EditButton";
import { EditableContainer } from "./Container";
import Entry from "./Entry";
import loadComponent from "./LoadComponent";

export interface SectionProps extends EditableProps {
    isEditing?: boolean;
    children?: any;
    title: string;
}

export default class Section extends React.Component<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.props.addChild({
            type: "Paragraph",
            value: "Enter value here"
        });
    }

    render() {
        let addButton = <div style={{ float: "right" }}>
            <button onClick={this.addChild}>Add</button>
        </div>

        let title: string | JSX.Element = this.props.title;

        if (this.props.isEditing) {
            title = <input onChange={this.props.updateData.bind(this, "title")} type="text" value={this.props.title} />;
        }
        
        return <section>
            <h2>
                {title}
                {addButton}
                <button onClick={this.props.toggleEdit}>Edit</button>
            </h2>

            {this.props.children.map((elem, idx) =>
                <React.Fragment key={idx}>
                    {elem}
                </React.Fragment>)
            }
        </section>;
    }
}