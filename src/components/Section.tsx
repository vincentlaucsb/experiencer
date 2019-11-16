import * as React from "react";
import ChildHolder from "./ChildHolder";
import Editable, { EditableState, EditableProps } from "./Editable";
import Entry from "./Entry";
import EditButton from "./EditButton";

interface SectionProps extends EditableProps {
    children?: any;
    title: string;
}

interface SectionState extends EditableState {
    children: ChildHolder;
}

export default class Section extends Editable<SectionProps, SectionState> {
    constructor(props: SectionProps) {
        super(props);

        this.state = {
            children: new ChildHolder(props.children),
            value: props.title,
            isEditing: false
        };

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.setState({
            children: this.state.children.addChild(<Entry />)
        });
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