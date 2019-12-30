import * as React from "react";
import Column from "./Column";
import Container from "./Container";
import ResumeNodeProps from "./ResumeNodeProps";
import { BasicResumeNode, ResumeNode } from "./utility/Types";

interface RowBase {
    justifyContent?: string;
    reverseDirection?: boolean;
}

export interface BasicRowProps extends BasicResumeNode, RowBase { }
export interface RowProps extends ResumeNodeProps, RowBase {}

export default class Row extends React.PureComponent<RowProps> {
    static readonly type: string = 'Row';

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
            <Container {...this.props} className="row" style={this.style}>
                {this.props.children}
            </Container>
        );
    }
}