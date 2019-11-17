import * as React from "react";
import ChildHolder from "./ChildHolder";
import Editable, { EditableState, EditableProps } from "./Editable";
import EditButton from "./EditButton";
import { EditableContainer } from "./Container";
import Entry from "./Entry";

interface SectionProps extends EditableProps {
    children?: any;
    title: string;
}

export default class Section extends EditableContainer<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.defaultChild = <Entry />;
        this.state = {
            children: new ChildHolder(this),
            value: props.title,
            isEditing: false
        };
    }

    render() {
        let addButton = <div style={{ float: "right" }}>
            <button onClick={this.addChild}>Add</button>
        </div>;

        let title: string | JSX.Element = this.state.value;

        if (this.state.isEditing) {
            title = <input onChange={this.updateValue} type="text" value={this.state.value} />;
        }

        return <section>
            <h2>
                {title}
                {addButton}
                <EditButton parent={this} />
            </h2>
            {this.state.children.render()}
        </section>;
    }
}