import * as React from "react";
import loadComponent from "./LoadComponent";
import ResumeComponent, { ResumeComponentProps, AddChild } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";

export interface EntryProps extends ResumeComponentProps {
    title?: string;
    subtitle?: string;
}

export default class Entry extends ResumeComponent<EntryProps> {
    constructor(props) {
        super(props);

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        if (this.props.addChild as AddChild) {
            (this.props.addChild as AddChild)({
                type: 'List'
            });
        }
    }

    render() {
        if (this.props.isEditing) {
            return <div>
                <input onChange={this.updateData.bind(this, "title")} value={this.props.title || ""} />
                <input onChange={this.updateData.bind(this, "subtitle")} value={this.props.subtitle || ""} />

                <EditButton {...this.props} />
            </div>
        }

        let buttons = <div style={{ float: "right" }}>
            <AddButton action={this.addChild} />
            <EditButton {...this.props} />
            <DeleteButton {...this.props} />
            <UpButton {...this.props} />
            <DownButton {...this.props} />
        </div>

        return <div>
            <h3>{this.props.title || "Enter a title"}
                {buttons}
            </h3>
            <p>{this.props.subtitle || "Enter a subtitle"}</p>

            {this.renderChildren()}
        </div>
    }
}