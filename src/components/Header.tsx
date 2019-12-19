import * as React from "react";
import { ResumeNodeProps } from "./ResumeNodeBase";
import Row from "./Row";

export default class Header extends Row {
    get className(): string {
        let classNames = new Set(super.className.split(' '));
        classNames.delete('row');
        return Array.from(classNames).join(' ');
    }

    render() {
        let value = this.props.isEditing ? <input onChange={(event) => this.updateData("value", event.target.value)}
            value={this.props.value} type="text" /> : this.props.value || "Enter a title";

        return (
            <header className={this.className} style={this.style} {...this.selectTriggerProps}>
                {this.renderGrabHandle()}
                <h1>
                    {value}
                </h1>
                {this.renderChildren()}
            </header>
        );
    }
}