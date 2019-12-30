import React from "react";
import Container from "./Container";
import { isEmpty } from "./Helpers";
import ResumeComponentProps from "./utility/Types";

export default class Column extends React.PureComponent<ResumeComponentProps> {
    static readonly type = 'Column';

    /** Get the index of this column */
    get position(): number {
        return this.props.id[this.props.id.length - 1];
    }

    get className(): string {
        let classNames = ['column', 'column-' + this.position];
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
        if (isEmpty(this.props.children)) {
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