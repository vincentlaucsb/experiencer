import React = require("react");
import loadComponent from "./LoadComponent";

export interface FlexibleRowProps {
    children?: Array<object>;
}

export default class FlexibleRow extends React.Component<FlexibleRowProps> {
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
                    {loadComponent(elem)}
                </React.Fragment>)
            }
        </div>
    }
}