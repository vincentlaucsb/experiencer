import * as React from "react";
import ResumeNodeBase, { ToolbarOption, ResumeNodeProps } from "./ResumeNodeBase";
import ResumeWrapper from "./ResumeWrapper";
import { ResumeNode } from "./utility/NodeTree";
import Column from "./Column";

interface RowProps extends ResumeNodeProps {
    evenColumns?: boolean;
    justifyContent?: string;
}

export default class Row<P extends RowProps=RowProps> extends ResumeNodeBase<P> {
    get className(): string {
        let classNames = ['row', super.className];
        return classNames.join(' ');
    }

    /** Returns true if ALL columns are empty */
    get hasEmptyColumns(): boolean {
        const children = this.props.children as Array<ResumeNode>;
        if (children) {
            for (let node of children) {
                if (node.type === Column.name) {
                    if (node.children && node.children.length > 0) {
                        return false;
                    }
                }
                else {
                    // Also return false if we have some child which is not a column
                    // Note: Happens for <Header />
                    return false;
                }
            }
        }

        return true;
    }

    /** Return the style for the main div */
    get style() : React.CSSProperties {
        let properties = {
            ...ResumeNodeBase.flexRowStyle,
            width: "100%",
            justifyContent: this.props.justifyContent || 'space-between'
        }

        if (this.hasEmptyColumns) {
            properties = {
                ...properties,
                minWidth: "100px",
                minHeight: "100px"
            }
        }

        return properties;
    }

    get additionalProps() {
        if (this.props.evenColumns) {
            return {
                evenColumns: this.props.evenColumns
            }
        }

        return {};
    }
    
    get customToolbarOptions() {
        let columnDistribution = {
            text: 'Distribute Columns Evenly',
            action: () => this.updateData('evenColumns', !(this.props.evenColumns || false))
        };

        if (this.props.evenColumns) {
            console.log("Distribute columns automatically");
            columnDistribution.text = 'Distribute Columns Automatically';
        }

        return [
            columnDistribution,
            {
                text: 'Justify Content',
                actions: [
                    {
                        text: 'Space between',
                        action: () => this.justifyContent('space-between')
                    },
                    {
                        text: 'Stack at beginning',
                        action: () => this.justifyContent('flex-start')
                    },
                    {
                        text: 'Stack at end',
                        action: () => this.justifyContent('flex-end')
                    },
                    {
                        text: 'Stack center',
                        action: () => this.justifyContent('center')
                    },
                    {
                        text: 'Space around',
                        action: () => this.justifyContent('space-around')
                    },
                    {
                        text: 'Space evenly',
                        action: () => this.justifyContent('space-evenly')
                    }
                ] as Array<ToolbarOption>
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
        ><div className={this.className} id={this.props.cssId} style={this.style} {...this.selectTriggerProps}>
            {this.renderGrabHandle()}
            {this.renderChildren()}
            </div>
        </ResumeWrapper>
    }
}