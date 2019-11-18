import { EditableProps } from "./Editable";
import React = require("react");
import EditButton from "./EditButton";

export interface TitleProps extends EditableProps {
    value: string;
}

export default class Title extends React.Component<TitleProps> {
    constructor(props: TitleProps) {
        super(props);
    }

    updateData(key: string, event: any) {
        this.props.updateData(key, event.target.value);
    }

    render() {
        if (this.props.isEditing) {
            return <React.Fragment>
                <input onChange={this.updateData.bind(this, "value")}
                    value={this.props.value} type="text" />
                <EditButton {...this.props} />
            </React.Fragment>;
        }

        return <h1>
            {this.props.value}
            <div style={{ display: "inline-block" }}>
                <EditButton {...this.props} />
            </div>
        </h1>;
    }
}