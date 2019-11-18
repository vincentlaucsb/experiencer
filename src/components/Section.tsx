import * as React from "react";
import ChildHolder from "./ChildHolder";
import Editable, { EditableState, EditableProps } from "./Editable";
import EditButton from "./EditButton";
import { EditableContainer } from "./Container";
import Entry from "./Entry";
import loadComponent from "./LoadComponent";

export interface SectionProps extends EditableProps {
    isEditing?: boolean;
    children?: Array<object>;
    title: string;
}

export default class Section extends React.Component<SectionProps> {
    constructor(props: SectionProps) {
        super(props);

        this.addChild = this.addChild.bind(this);
        this.updateData = this.updateData.bind(this);
    }

    addChild() {
        this.props.addChild({
            type: "Paragraph",
            value: "Enter value here"
        });
    }

    toggleNestedEdit(idx: number) {
        let currentChildData = this.props.children[idx]['isEditing'];
        this.updateNestedData(idx, "isEditing", !currentChildData);
    }

    updateNestedData(idx: number, key: string, data: any) {
        let newChildren = this.props.children;
        newChildren[idx][key] = data;
        this.props.updateData("children", newChildren);
    }

    updateData(key: string, event: any) {
        this.props.updateData(key, event.target.value);
    }

    render() {
        let addButton = <div style={{ float: "right" }}>
            <button onClick={this.addChild}>Add</button>
        </div>

        let title: string | JSX.Element = this.props.title;

        if (this.props.isEditing) {
            title = <input onChange={this.updateData.bind(this, "title")} type="text" value={this.props.title} />;
        }
        
        return <section>
            <h2>
                {title}
                {addButton}
                <button onClick={this.props.toggleEdit}>Edit</button>
            </h2>

            {this.props.children.map((elem, idx) =>
                <React.Fragment key={idx}>
                    {loadComponent(elem,
                        {
                        toggleEdit: this.toggleNestedEdit.bind(this, idx),
                        updateData: this.updateNestedData.bind(this, idx)
                    })
                    }
                </React.Fragment>)
            }
        </section>;
    }
}