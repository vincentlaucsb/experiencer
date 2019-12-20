import * as React from "react";
import Row, { RowProps, BasicRowProps } from "./Row";
import ReactQuill from "react-quill";
import RichText from "./RichText";

interface HeaderBase {
    subtitle?: string;
}

export interface BasicHeaderProps extends BasicRowProps, HeaderBase { };
export interface HeaderProps extends RowProps, HeaderBase { };

export default class Header extends Row<HeaderProps> {
    static readonly type: string = 'Header';

    get className(): string {
        let classNames = new Set(super.className.split(' '));
        classNames.delete('row');
        return Array.from(classNames).join(' ');
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
                {this.renderGrabHandle()}
                <hgroup>
                    {value}
                    {subtitle}
                </hgroup>
                {this.renderChildren()}
            </header>
        );
    }
}