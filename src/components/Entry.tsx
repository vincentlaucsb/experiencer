import * as React from "react";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";
import { Nonprintable } from "./Nonprintable";

export interface EntryProps extends ResumeComponentProps {
    title?: string;
    subtitle?: string;
}

export default class Entry extends ResumeComponent<EntryProps> {
    constructor(props) {
        super(props);
    }
    
    render() {
        let buttons = <Nonprintable isPrinting={this.props.isPrinting}>
            <div style={{ float: "right" }}>
                <AddButton action={this.addList} />
                <EditButton {...this.props} />
                <DeleteButton {...this.props} />
                <UpButton {...this.props} />
                <DownButton {...this.props} />
            </div>
        </Nonprintable>

        let title: any = this.props.title || "Enter a title";
        let subtitle: any = this.props.subtitle || "Enter a subtitle";

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} value={this.props.title || ""} />
            subtitle = <input onChange={this.updateDataEvent.bind(this, "subtitle")} value={this.props.subtitle || ""} />
        }

        return <div>
            <h3>{title} {buttons}</h3>
            <p className="subtitle">{subtitle}</p>

            {this.renderChildren()}
        </div>
    }
}