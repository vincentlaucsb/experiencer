import * as React from "react";
import ResumeComponent, { ResumeComponentProps } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";
import { Nonprintable } from "./Nonprintable";

export interface EntryProps extends ResumeComponentProps {
    title?: string;
    titleRight?: string;
    subtitle?: string;
    subtitleRight?: string;
}

export default class Entry extends ResumeComponent<EntryProps> {
    constructor(props) {
        super(props);
    }
    
    render() {
        let buttons = <Nonprintable isPrinting={this.props.isPrinting}>
                <AddButton action={this.addList} />
                <EditButton {...this.props} />
                <DeleteButton {...this.props} />
                <UpButton {...this.props} />
                <DownButton {...this.props} />
        </Nonprintable>

        let title: any = this.props.title || "Enter a title";
        let titleRight: any = this.props.titleRight || "";
        let subtitle: any = this.props.subtitle || "Enter a subtitle";
        let subtitleRight: any = this.props.subtitleRight || "";

        if (this.props.isEditing) {
            title = <input onChange={this.updateDataEvent.bind(this, "title")} value={this.props.title || ""} />
            titleRight = <input onChange={this.updateDataEvent.bind(this, "titleRight")} value={this.props.titleRight || ""} />
            subtitle = <input onChange={this.updateDataEvent.bind(this, "subtitle")} value={this.props.subtitle || ""} />
            subtitleRight = <input onChange={this.updateDataEvent.bind(this, "subtitleRight")} value={this.props.subtitleRight || ""} />
        }

        return <div className="resume-entry">
            <h3 className="flex-row"><span>{title}{buttons}</span> <span className="title-right">{titleRight} </span></h3>
            <p className="flex-row subtitle">{subtitle} <span className="subtitle-right">{subtitleRight}</span></p>

            {this.renderChildren()}
        </div>
    }
}