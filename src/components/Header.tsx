import * as React from "react";
import Row, { RowProps, BasicRowProps } from "./Row";
import ReactQuill from "react-quill";
import RichText from "./RichText";
import ResumeNodeBase from "./ResumeNodeBase";

interface HeaderBase {
    orientRow?: boolean;
    subtitle?: string;
}

export interface BasicHeaderProps extends BasicRowProps, HeaderBase { };
export interface HeaderProps extends RowProps, HeaderBase { };

export default class Header extends ResumeNodeBase<HeaderProps> {
    static readonly type: string = 'Header';

    get style(): React.CSSProperties {
        let style: React.CSSProperties = {};
        if (this.props.orientRow) {
            style = {
                ...style,
                ...ResumeNodeBase.flexRowStyle
            };
        }
        else {
            style.display = 'flex';
            style.flexDirection = 'column';
        }

        return style;
    }

    render() {
        let value = this.props.isEditing ? <ReactQuill
            modules={RichText.quillModules}
            value={this.props.value || ""}
            onChange={(text) => this.updateData("value", text)}
        /> : <h1 dangerouslySetInnerHTML={{ __html: this.props.value || "Enter a title" }} />;

        let subtitle = this.props.isEditing ? <ReactQuill
            modules={RichText.quillModules}
            value={this.props.subtitle || ""}
            onChange={(text) => this.updateData("subtitle", text)}
        /> : <h2 className="subtitle" dangerouslySetInnerHTML={{ __html: this.props.subtitle || "" }} />;

        return (
            <header className={this.className} style={this.style} {...this.selectTriggerProps}>
                <hgroup>
                    {value}
                    {subtitle}
                </hgroup>
                {this.renderChildren()}
            </header>
        );
    }
}