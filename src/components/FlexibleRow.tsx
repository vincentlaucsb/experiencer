import * as React from "react";
import ResumeNodeBase, { ToolbarOption, ResumeNodeProps } from "./ResumeNodeBase";
import ResumeWrapper from "./ResumeWrapper";

export class Column extends ResumeNodeBase {
    /** Get the index of this column */
    get position(): number {
        return this.props.id[this.props.id.length - 1];
    }

    get className(): string {
        let positionClsName = 'column-' + this.position;
        return [positionClsName, 'resume-column', 'flex-col', super.className].join(' ');
    }

    /** Returns a "handle" which can be used to select the column itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="column-grab-handle-container">
                <div className="column-grab-handle">
                    Click here to select column
                </div>
            </div>
        }

        return <></>
    }

    render() {
        let helperText = <></>;
        if (this.isEmpty && !this.isSelected) {
            helperText = <span>Column {this.position}: Click to select and add content</span>
        }

        return <div {...this.selectTriggerProps} className={this.className} style={{ minWidth: "100px", minHeight: "100px" }}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
            {helperText}
        </div>
    }
}

interface RowProps extends ResumeNodeProps {
    justifyContent?: string;
}

export default class Row<P extends RowProps=RowProps> extends ResumeNodeBase<P> {
    get className(): string {
        let classNames = ['resume-row', 'flex-row', super.className];
        return classNames.join(' ');
    }

    get childTypes() {
        return 'Column';
    }

    get styles() : React.CSSProperties {
        let properties = {
            width: "100%",
            minWidth: "100px",
            minHeight: "100px",
            justifyContent: this.props.justifyContent || 'space-between'
        }

        return properties;
    }

    get customToolbarOptions() {
        return [
            {
                text: 'Justify Content',
                actions: [
                    {
                        text: 'Space between',
                        action: () => this.justifyContent('space-between')
                    } as ToolbarOption,
                    {
                        text: 'Stack at beginning',
                        action: () => this.justifyContent('flex-start')
                    } as ToolbarOption,
                    {
                        text: 'Stack at end',
                        action: () => this.justifyContent('flex-end')
                    } as ToolbarOption,
                    {
                        text: 'Stack center',
                        action: () => this.justifyContent('center')
                    } as ToolbarOption,
                    {
                        text: 'Space around',
                        action: () => this.justifyContent('space-around')
                    } as ToolbarOption,
                    {
                        text: 'Space evenly',
                        action: () => this.justifyContent('space-evenly')
                    } as ToolbarOption
                ]
            }
        ];
    }

    justifyContent(text: string) {
        this.updateData('justifyContent', text);
    }

    /** Returns a "handle" which can be used to select the row itself and not the columns it contains */
    renderGrabHandle() {
        if (this.isHovering && !this.isSelected) {
            return <div className="row-grab-handle-container">
                <div className="row-grab-handle">
                    Click here to select row
                </div>
            </div>
        }

        return <></>
    }
    
    render() {
        // TODO: Only have minHeight if this row's columns have no children
        return <ResumeWrapper
            customToolbar={this.customToolbarOptions}
            updateToolbar={this.props.updateCustomOptions}
            id={this.props.id} isSelected={this.isSelected}
            toggleEdit={this.toggleEdit}
            isEditing={this.props.isEditing}
        ><div className={this.className} style={this.styles} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
            </div>
        </ResumeWrapper>
    }
}