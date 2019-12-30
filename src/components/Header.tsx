import * as React from "react";
import { RowProps, BasicRowProps } from "./Row";
import ResumeNodeBase from "./ResumeNodeBase";
import QuillEditor from "./controls/inputs/QuillEditor";
import Container from "./Container";

interface HeaderBase {
    distribution?: 'top-to-bottom' | 'left-to-right' | 'bottom-to-top' | 'right-to-left';
    justifyContent?: string;
    subtitle?: string;
}

export interface BasicHeaderProps extends BasicRowProps, HeaderBase { };
export interface HeaderProps extends RowProps, HeaderBase { };

export default class Header extends ResumeNodeBase<HeaderProps> {
    static readonly type: string = 'Header';

    get style(): React.CSSProperties {
        let style: React.CSSProperties = {};
        style.display = 'flex';
        style.justifyContent = this.props.justifyContent || 'space-between';

        switch (this.props.distribution || 'top-to-bottom') {
            case 'top-to-bottom':
                style.flexDirection = 'column';
                break;
            case 'bottom-to-top':
                style.flexDirection = 'column-reverse';
                break;
            case 'left-to-right':
                style.flexDirection = 'row';
                break;
            case 'right-to-left':
                style.flexDirection = 'row-reverse';
                break;
        }

        return style;
    }

    render() {
        let value = <h1 dangerouslySetInnerHTML={{ __html: this.props.value || "Enter a title" }} />
        let subtitle = <h2 className="subtitle" dangerouslySetInnerHTML={{ __html: this.props.subtitle || "" }} />

        if (this.props.isEditing) {
            value = <QuillEditor
                id={`${this.props.uuid}-title`}
                value={this.props.value || ""}
                onChange={(text) => this.updateData("value", text)}
            />

            subtitle = <QuillEditor
                id={`${this.props.uuid}-subtitle`}
                value={this.props.subtitle || ""}
                onChange={(text) => this.updateData("subtitle", text)}
            />
        }
        
        return (
            <Container displayAs="header" {...this.props} style={this.style}>
                <hgroup>
                    {value}
                    {subtitle}
                </hgroup>
                {this.props.children}
            </Container>
        );
    }
}