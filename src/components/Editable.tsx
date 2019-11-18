import * as React from "react";

export interface EditableProps {
    isEditing?: boolean;
    toggleEdit: () => void;
    updateData: (key: string, data: any) => void;
    addChild: (node: object) => void;
    deleteChild: () => void;
}

export interface EditableStateBase {
    isEditing: boolean;
}

export interface EditableState extends EditableStateBase {
    value: string;
}

interface HTMLValueElement extends HTMLElement {
    value: string;
}

export abstract class EditableBase<P = {}, S extends EditableState = EditableState> extends React.Component<P, S> {
    constructor(props: P) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
    }

    toggleEdit() {
        this.setState({
            isEditing: !this.state.isEditing
        });
    }
}

// Represents an editable resume component
export default abstract class Editable<
    Props extends EditableProps = EditableProps,
    State extends EditableState = EditableState>
    extends EditableBase<Props, State> {
    constructor(props: Props) {
        super(props);

        this.updateValue = this.updateValue.bind(this);
    }

    updateValue<T extends HTMLValueElement>(event: React.ChangeEvent<T>) {
        this.setState({ value: event.target.value });
    }
}

export interface MultiEditableState extends EditableState {
    // A mapping of IDs to text values
    values: Map<string, string>;
}

export abstract class MultiEditable<
    Props = {},
    State extends MultiEditableState = MultiEditableState> extends EditableBase<Props, State> {
    constructor(props: Props) {
        super(props);
        this.updateValue = this.updateValue.bind(this);
    }
    
    updateValue<T extends HTMLValueElement>(key: string, event: React.ChangeEvent<T>) {
        this.state.values.set(key, event.target.value);
        this.setState({
            values: this.state.values
        });
    }
}