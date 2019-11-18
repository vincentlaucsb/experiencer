import * as React from "react";
import ChildHolder from "./ChildHolder";
import { MultiEditableContainer } from "./Container";

interface EntryProps {
    children?: any;
}

export default class Entry extends MultiEditableContainer<EntryProps> {
    constructor(props) {
        super(props);

        this.state = {
            children: new ChildHolder(this),
            value: "",
            isEditing: false,
            values: new Map<string, string>()
        };
    }
    
    render() {
        if (this.state.isEditing) {
            return <div>
                <input onChange={this.updateValue.bind(this, "title")} value={this.state.values.get("title") || ""} />
                <input onChange={this.updateValue.bind(this, "subtitle")} value={this.state.values.get("subtitle") || ""} />
                <button onClick={this.toggleEdit}>Done</button>
            </div>
        }

        return <div>
            <h3>{this.state.values.get("title") || "Enter a title"}</h3>
            <p>{this.state.values.get("subtitle") || "Enter a subtitle"}</p>
            {this.state.children.render()}
            <button onClick={this.addChild}>Add</button>
            <button onClick={this.toggleEdit}>Edit</button>
        </div>
    }
}