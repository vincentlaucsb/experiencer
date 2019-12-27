import ResumeNodeBase from "./ResumeNodeBase";
import React from "react";

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
        return <div className={this.className} style={this.style} id={this.props.htmlId} {...this.selectTriggerProps}>
            {this.renderChildren()}
        </div>
    }
}