import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";
import React from "react";
import { BasicResumeNode } from "./utility/NodeTree";

interface ColumnBase {
    evenColumns?: boolean;
}

export interface BasicColumnProps extends BasicResumeNode, ColumnBase { }
interface ColumnProps extends ResumeNodeProps, ColumnBase { }

export default class Column extends ResumeNodeBase<ColumnProps> {
    static readonly type = 'Column';

    /** Get the index of this column */
    get position(): number {
        return this.props.id[this.props.id.length - 1];
    }

    get className(): string {
        let classNames = ['column', super.className];
        classNames.push('column-' + this.position);

        if (this.props.isLast) {
            classNames.push('column-last');
        }

        return classNames.join(' ');
    }

    get style(): React.CSSProperties {
        let properties: React.CSSProperties = {
            display: 'flex',
            flexDirection: 'column',
        };

        if (this.props.evenColumns) {
            properties.flexBasis = '100%';
        }

        if (!(this.props.children && this.props.children.length > 0)) {
            properties = {
                ...properties,
                minWidth: "100px",
                minHeight: "100px"
            };
        }

        return properties;
    }
    
    render() {
        let helperText = <></>;
        if (this.isEmpty) { // && !this.isSelected) {
            helperText = <span>Column {this.position}: Click to select and add content</span>
        }

        return <div {...this.selectTriggerProps} className={this.className} style={this.style}
            id={this.props.htmlId}>
            {this.renderChildren()}
            {helperText}
        </div>
    }
}