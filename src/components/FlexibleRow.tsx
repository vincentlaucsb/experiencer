import * as React from "react";
import ResumeNodeBase from "./ResumeNodeBase";

export class Column extends ResumeNodeBase {
    /** Get the index of this column */
    get position(): number {
        return this.props.id[this.props.id.length - 1];
    }

    get className(): string {
        let positionClsName = 'column-' + this.position;
        return [positionClsName, 'flex-col', super.className].join(' ');
    }

    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.displayBorder && !this.isSelected) {
            return <div className="column-grab-handle-container">
                <div className="d-flex align-items-center column-grab-handle">
                    Click here to select column
                </div>
            </div>
        }

        return <></>
    }

    render() {
        let helperText = <></>;
        if (this.isEmpty && !this.isSelected) {
            helperText = <span>Column {this.position}: Click to select and add content</span>
        }

        return <div {...this.selectTriggerProps} className={this.className} style={{ minWidth: "100px", minHeight: "100px" }}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
            {helperText}
        </div>
    }
}

export default class Row extends ResumeNodeBase {
    get className(): string {
        return ['flex-row', 'flex-spread', super.className].join(' ');
    }

    get childTypes() {
        return 'Column';
    }

    /** Returns a "handle" which can be used to select the row itself and not the columns it contains */
    renderGrabHandle() {
        if (this.displayBorder && !this.isSelected) {
            return <div className="row-grab-handle-container">
                <div className="d-flex align-items-center row-grab-handle">
                    Click here to select row
                </div>
            </div>
        }

        return <></>
    }
    
    render() {
        // TODO: Only have minHeight if this row's columns have no children
        return <div className={this.className} style={{ width: "100%", minWidth: "100px", minHeight: "100px" }} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
        </div>
    }
}