import React = require("react");
import loadComponent from "./LoadComponent";
import { EditableState, EditableProps } from "./Editable";

export interface FlexibleRowProps extends EditableProps {
    children?: Array<object>;
}

export default class FlexibleRow extends React.Component<FlexibleRowProps> {
    constructor(props) {
        super(props);
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

    render() {
        return <div style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "row",
            width: "100%"
        }}>
            {this.props.children.map((elem, idx) =>
                <React.Fragment key={idx}>
                    {loadComponent(elem, {
                        toggleEdit: this.toggleNestedEdit.bind(this, idx),
                        updateData: this.updateNestedData.bind(this, idx)
                    })}
                </React.Fragment>)
            }
        </div>
    }
}