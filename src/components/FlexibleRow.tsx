import * as React from "react";
import loadComponent from "./LoadComponent";
import ResumeComponent from "./ResumeComponent";

export default class FlexibleRow extends ResumeComponent {
    constructor(props) {
        super(props);
    }
    
    render() {
        return <div className="flex-row" style={{ width: "100%" }}>
            {this.renderChildren()}
        </div>
    }
}