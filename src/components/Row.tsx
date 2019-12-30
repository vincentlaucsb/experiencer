import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import { ResumeNode, BasicResumeNode } from "./utility/NodeTree";
import Column from "./Column";

interface RowBase {
    justifyContent?: string;
    reverseDirection?: boolean;
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
        const children = this.props.childNodes as Array<ResumeNode>;
        if (children) {
            for (let node of children) {
                if (node.type === Column.type) {
                    if (node.childNodes && node.childNodes.length > 0) {
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
        let properties: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'row',
            width: "100%",
            justifyContent: this.props.justifyContent || 'space-between'
        }

        if (this.props.reverseDirection) {
            properties.flexDirection = "row-reverse";
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

    render() { 
        return (
            <div className={this.className}
                id={this.props.htmlId} style={this.style} {...this.selectTriggerProps}>
                {this.props.children}
            </div>
        );
    }
}