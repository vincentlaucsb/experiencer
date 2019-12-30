import ResumeNodeBase from "./ResumeNodeBase";
import React from "react";
import Container from "./Container";

export default class Column extends ResumeNodeBase {
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

        if (!(this.props.childNodes && this.props.childNodes.length > 0)) {
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

        return <Container {...this.props}
            className={this.className}
            style={this.style}>
            {this.props.children}
            {helperText}
        </Container>
    }
}