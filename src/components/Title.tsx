import Editable, { EditableState, EditableProps } from "./Editable";
import React = require("react");
import EditButton from "./EditButton";

export interface TitleProps extends EditableProps {
    value: string;
}

export default class Title extends Editable<TitleProps, EditableState> {
    constructor(props: TitleProps) {
        super(props);

        this.state = {
            isEditing: false,
            value: props.value
        };
    }

    render() {
        if (this.state.isEditing) {
            return <React.Fragment>
                <input onChange={this.updateValue}
                    value={this.state.value} type="text" />
                <EditButton parent={this} />
            </React.Fragment>;
        }

        return <h1>
            {this.state.value}
            <div style={{ display: "inline-block" }}>
                <EditButton parent={this} />
            </div>
        </h1>;
    }
}