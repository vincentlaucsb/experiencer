import ResumeNodeBase from "./ResumeNodeBase";
import React from "react";
import Container from "./Container";
import { isEmpty } from "./Helpers";

export default class Grid extends ResumeNodeBase {
    static readonly type = 'Grid';

    get style() : React.CSSProperties {
        let style: React.CSSProperties = {
            display: "grid",
        };

        if (isEmpty(this.props.children)) {
            style.minWidth = '100px';
            style.minHeight = '100px';
        }

        return style;
    }

    render() {
        const helperText = isEmpty(this.props.children) ? <span>
            This grid is empty. Click here to select it and add items.
            </span>  : <></>

        return <Container {...this.props} className="grid-container"
            style={this.style}>
            {helperText}
            {this.props.children}
        </Container>
    }
}