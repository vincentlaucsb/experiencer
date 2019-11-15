import { MultiEditable } from "./Editable";
import * as React from "react";

export default class Entry extends MultiEditable {
    constructor(props) {
        super(props);

        this.state = {
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
            <h3>{this.state.values.get("title")}</h3>
            <p>{this.state.values.get("subtitle")}</p>
            <button onClick={this.toggleEdit}>Edit</button>
        </div>
    }
}