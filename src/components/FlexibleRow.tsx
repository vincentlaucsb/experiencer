import * as React from "react";
import ResumeComponent from "./ResumeComponent";

export default class FlexibleRow extends ResumeComponent {
    constructor(props) {
        super(props);

        this.state = {
            isHovering: false,
            isSelected: false
        };
    }
    
    render() {
        let className = "flex-row";

        if (!this.props.isPrinting && (this.state.isHovering || this.state.isSelected)) {
            className += ' resume-selected';
        }

        return <div className={className} style={{ width: "100%" }} {...this.getSelectTriggerProps()}>
            {this.renderChildren()}
        </div>
    }
}