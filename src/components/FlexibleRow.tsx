import React = require("react");
import loadComponent from "./LoadComponent";
import ResumeComponent from "./ResumeComponent";

export default class FlexibleRow extends ResumeComponent {
    constructor(props) {
        super(props);
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