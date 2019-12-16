import * as React from "react";
import ResumeNodeBase, { ResumeNodeProps } from "./ResumeNodeBase";

export interface HeaderProps extends ResumeNodeProps {
    orientation?: 'row' | 'column';
}

export default class Header extends ResumeNodeBase<HeaderProps> {
    static get type() {
        return 'Header';
    }

    constructor(props: ResumeNodeProps) {
        super(props);

        this.orientColumn = this.orientColumn.bind(this);
        this.orientRow = this.orientRow.bind(this);
    }

    get customMenuOptions() {
        return [
            {
                text: 'Orient Items Horizontally',
                action: this.orientRow
            },
            {
                text: 'Orient Items Vertically',
                action: this.orientColumn
            }
        ]
    }

    get className(): string {
        let classNames = [super.className];

        if (this.props.orientation === 'row') {
            classNames.push('flex-row flex-spread');
        } else {
            classNames.push('flex-col');
        }

        return classNames.join(' ');
    }

    orientColumn() {
        this.updateData('orientation', 'column');
    }

    orientRow() {
        this.updateData('orientation', 'row');
    }
    
    render() {
        let value = this.props.isEditing ? <input onChange={this.updateDataEvent.bind(this, "value")}
            value={this.props.value} type="text" /> : this.props.value || "Enter a title";

        return <header className={this.className}>
            <h1 {...this.selectTriggerProps}>
                {value}
            </h1>
            {this.renderChildren()}
        </header>;
    }
}