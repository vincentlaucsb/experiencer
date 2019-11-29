import * as React from "react";
import ResumeComponent, { ResumeComponentProps, SelectedComponentProps, Action } from "./ResumeComponent";
import EditButton, { AddButton, DownButton, UpButton, DeleteButton } from "./Buttons";
import { Nonprintable } from "./Nonprintable";

export interface EntryProps extends ResumeComponentProps {
    title?: string;
    titleRight?: string;
    subtitle?: string;
    subtitleRight?: string;
}

interface EntryState {
    isSelected: boolean;
}

export default class Entry extends ResumeComponent<EntryProps, EntryState> {
    constructor(props) {
        super(props);

        this.state = {
            isSelected: false
        };

        this.setSelected = this.setSelected.bind(this);
    }

    setSelected() {
        if (!this.state.isSelected) {
            this.setState({ isSelected: true });
            if (this.props.unselect as Action) {
                (this.props.unselect as Action)();
            }
            (this.props.updateSelected as (data: SelectedComponentProps) => void)({
                unselect: this.unselect.bind(this)
            });
        }
    }

    unselect() {
        this.setState({
            isSelected: false
        });
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

        let style = {};
        if (this.state.isSelected) {
            style = {
                border: "2px solid blue"
            };
        }

        return <div className="resume-entry" style={style}>
            <h3 className="flex-row" onClick={this.setSelected}><span>{title}{buttons}</span> <span className="title-right">{titleRight} </span></h3>
            <p className="flex-row subtitle">{subtitle} <span className="subtitle-right">{subtitleRight}</span></p>

            {this.renderChildren()}
        </div>
    }
}