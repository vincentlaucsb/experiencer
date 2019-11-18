import React = require("react");

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
            {this.props.children}
        </div>
    }
}