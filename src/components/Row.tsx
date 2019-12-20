import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import { ResumeNode, BasicResumeNode } from "./utility/NodeTree";
import Column from "./Column";

interface RowBase {
    evenColumns?: boolean;
    justifyContent?: string;
}

export interface BasicRowProps extends BasicResumeNode, RowBase { }
export interface RowProps extends ResumeNodeProps, RowBase {}

export default class Row<P extends RowProps=RowProps> extends ResumeNodeBase<P> {
    static readonly type: string = 'Row';

    get className(): string {
        let classNames = ['row', super.className];
        return classNames.join(' ');
    }

    /** Returns true if ALL columns are empty */
    get hasEmptyColumns(): boolean {
        const children = this.props.children as Array<ResumeNode>;
        if (children) {
            for (let node of children) {
                if (node.type === Column.type) {
                    if (node.children && node.children.length > 0) {
                        return false;
                    }
                }
                else {
                    // Also return false if we have some child which is not a column
                    // Note: Happens for <Header />
                    return false;
                }
            }
        }

        return true;
    }

    /** Return the style for the main div */
    get style() : React.CSSProperties {
        let properties = {
            ...ResumeNodeBase.flexRowStyle,
            width: "100%",
            justifyContent: this.props.justifyContent || 'space-between'
        }

        if (this.hasEmptyColumns) {
            properties = {
                ...properties,
                minWidth: "100px",
                minHeight: "100px"
            }
        }

        return properties;
    }

    get additionalProps() {
        if (this.props.evenColumns) {
            return {
                evenColumns: this.props.evenColumns
            }
        }

        return {};
    }
    
    justifyContent(text: string) {
        this.updateData('justifyContent', text);
    }

    /** Returns a "handle" which can be used to select the row itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="row-grab-handle-container">
                <div className="row-grab-handle">
                    Click here to select row
                </div>
            </div>
        }

        return <></>
    }
    
    render() {
        return (
            <div className={this.className} id={this.props.htmlId} style={this.style} {...this.selectTriggerProps}>
                {this.renderGrabHandle()}
                {this.renderChildren()}
            </div>
        );
    }
}