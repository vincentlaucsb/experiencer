import { MultiEditable, MultiEditableState } from "./Editable";
import * as React from "react";
import ChildHolder from "./ChildHolder";
import List from "./List";

interface EntryProps {
    children?: any;
}

interface EntryState extends MultiEditableState {
    children: ChildHolder;
}

export default class Entry extends MultiEditable<EntryProps, EntryState> {
    constructor(props) {
        super(props);

        this.state = {
            children: new ChildHolder(props.children),
            value: "",
            isEditing: false,
            values: new Map<string, string>()
        };

        this.addChild = this.addChild.bind(this);
    }

    addChild() {
        this.setState({
            children: this.state.children.addChild(<List />)
        });
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