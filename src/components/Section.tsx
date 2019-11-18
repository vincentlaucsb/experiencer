import * as React from "react";
import Editable, { EditableState, EditableProps } from "./Editable";
import loadComponent from "./LoadComponent";
import EditButton from "./EditButton";

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

    addNestedChild(idx: number, node: object) {
        let newChildren = this.props.children;
        if (!newChildren[idx]['children']) {
            newChildren[idx]['children'] = new Array<object>();
        }

        newChildren[idx]['children'].push(node);
        this.props.updateData("children", newChildren);
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
        let buttons = <div style={{ float: "right" }}>
            <button onClick={this.addChild}>Add</button>
            <EditButton {...this.props} />
            <button onClick={this.props.deleteChild}>Delete</button>
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