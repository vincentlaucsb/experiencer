import ResumeNodeBase from "./ResumeNodeBase";
import React from "react";
import Container from "./Container";

export default class Grid extends ResumeNodeBase {
    static readonly type = 'Grid';

    get className() {
        return ['grid-container', super.className].join(' ');
    }

    get style() : React.CSSProperties {
        let style: React.CSSProperties = {
            display: "grid",
        };

        if (this.isEmpty) {
            style.minWidth = '100px';
            style.minHeight = '100px';
        }

        return style;
    }

    render() {
        const helperText = this.isEmpty ? <span>
            This grid is empty. Click here to select it and add items.
            </span>  : <></>

        return <Container {...this.props} className={this.className} style={this.style}>
            {helperText}
            {this.props.children}
        </Container>
    }
}