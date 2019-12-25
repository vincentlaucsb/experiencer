import ResumeNodeBase from "./ResumeNodeBase";
import React from "react";

export default class Grid extends ResumeNodeBase {
    static get type() {
        return 'Grid';
    }

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

    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="row-grab-handle-container">
                <div className="row-grab-handle">
                    <p>Click here to select grid</p>
                </div>
            </div>
        }

        return <></>
    }

    render() {
        return <div className={this.className} style={this.style} id={this.props.htmlId} {...this.selectTriggerProps}>
            {this.renderChildren()}
        </div>
    }
}