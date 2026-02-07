import React from "react";
import Container from "./Container";
import ResumeComponentProps from "@/types";

export default class Grid extends React.PureComponent<ResumeComponentProps> {
    static readonly type = 'Grid';

    get style() : React.CSSProperties {
        let style: React.CSSProperties = {
            display: "grid",
        };

        if (React.Children.count(this.props.children) === 0) {
            style.minWidth = '100px';
            style.minHeight = '100px';
        }

        return style;
    }

    render() {
        const helperText = React.Children.count(this.props.children) === 0 ? <span>
            This grid is empty. Click here to select it and add items.
            </span>  : <></>

        return <Container {...this.props} className="grid-container"
            style={this.style}>
            {helperText}
            {this.props.children}
        </Container>
    }
}