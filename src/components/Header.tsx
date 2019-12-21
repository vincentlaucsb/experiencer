import * as React from "react";
import Row, { RowProps, BasicRowProps } from "./Row";
import ReactQuill from "react-quill";
import RichText from "./RichText";
import ResumeNodeBase from "./ResumeNodeBase";

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