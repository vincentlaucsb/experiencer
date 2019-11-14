import * as React from "react";

export interface EditableProps {

}

export interface EditableStateBase {
    isEditing: boolean;
}

export interface EditableState extends EditableStateBase {
    value: string;
}

export interface MultiEditableState extends EditableStateBase {
    // A mapping of IDs to text values
    values: Map<string, string>;
}

interface HTMLValueElement extends HTMLElement {
    value: string;
}

// Represents an editable resume component
export default abstract class Editable<
    Props extends EditableProps, State extends EditableState>
    extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.updateValue = this.updateValue.bind(this);
    }

    toggleEdit() {
        this.setState({
            isEditing: !this.state.isEditing
        });
    }

    updateValue<T extends HTMLValueElement>(event: React.ChangeEvent<T>) {
        this.setState({ value: event.target.value });
    }

    abstract renderEditing(): JSX.Element;
    abstract renderViewing(): JSX.Element;

    render() {
        return this.state.isEditing ? this.renderEditing() : this.renderViewing();
    }
}