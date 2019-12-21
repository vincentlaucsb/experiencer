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
        return {
            display: "grid",
            minWidth: "100px",
            minHeight: "100px"
        };
    }

    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="column-grab-handle-container">
                <div className="column-grab-handle">
                    Click here to select grid
                </div>
            </div>
        }

        return <></>
    }

    render() {
        return <div className={this.className} style={this.style} id={this.props.htmlId} {...this.selectTriggerProps}>
            {this.renderChildren()}
            {this.renderGrabHandle()}
        </div>
    }
}