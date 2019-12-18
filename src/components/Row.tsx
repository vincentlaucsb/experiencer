import * as React from "react";
import ResumeNodeBase, { ToolbarOption, ResumeNodeProps } from "./ResumeNodeBase";
import ResumeWrapper from "./ResumeWrapper";

interface RowProps extends ResumeNodeProps {
    justifyContent?: string;
}

export default class Row<P extends RowProps=RowProps> extends ResumeNodeBase<P> {
    get className(): string {
        let classNames = ['resume-row', super.className];
        return classNames.join(' ');
    }

    /** Return the style for the main div */
    get style() : React.CSSProperties {
        return {
            ...ResumeNodeBase.flexRowStyle,
            width: "100%",
            minWidth: "100px",
            minHeight: "100px",
            justifyContent: this.props.justifyContent || 'space-between'
        }
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
        ><div className={this.className} style={this.style} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
            </div>
        </ResumeWrapper>
    }
}