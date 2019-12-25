﻿// TODO: This whole file is a strong candidate for refactoring/testing when time is available

import React from "react";
import uuid from 'uuid/v4';

interface MappedTextFieldsState {
    isAddingKey: boolean;
    isEditing: boolean;
    newKey: string;
}

interface ValueFieldProps {
    value?: string;
    isEditing: boolean;
    updateText: (value: string) => void;
    suggestions?: Array<string>;

    delete?: () => void;
    toggleParentEdit: () => void;
}

function ValueField(props: ValueFieldProps) {
    let [value, updateValue] = React.useState(props.value || "");
    let [isEditing, setEditing] = React.useState(props.isEditing);

    /** Is this the first time mounting? */
    let [initialMount, setInitialMount] = React.useState(false);

    /** This field will automatically be in an editing state when it first mounts */
    if (!initialMount) {
        setEditing(true);
        setInitialMount(true);
    }

    const onClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        setEditing(true);

        if (!props.isEditing) {
            props.toggleParentEdit();
        }
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setEditing(false);
            props.updateText(value);
        }
    }

    React.useEffect(() => {
        // When the parent tells this to stop editing, then stop editing
        if (!props.isEditing && isEditing) {
            setEditing(false);
        }

        // Update parent
        if (!initialMount) {
            props.updateText(value);
        }
    }, [props.isEditing, isEditing]);

    let suggestions = <></>
    let suggestionId = "";
    if (props.suggestions) {
        suggestionId = uuid();
        suggestions = (<datalist id={suggestionId}>
            {props.suggestions.map((value) => <option value={value} />)}
        </datalist>
        );
    }

    if (isEditing) {
        return <>
            <input autoFocus onChange={(event) => updateValue(event.target.value)}
                onKeyDown={onKeyDown}
                value={value}
                list={suggestionId}
            />
            {suggestions}
            <button onClick={props.delete}>Delete</button>
        </>
    }

    return (
        <span onClick={onClick}>
            {value.length > 0 ? value : "Enter a value"}
        </span>
    );
}

export interface MappedTextFieldsProps {
    value: Map<string, string>;
    updateValue: (key: string, value: string) => void;
    deleteKey: (key: string) => void;

    /** An array of text input suggestions for new keys */
    keySuggestions?: Array<string>;

    /** Render prop for rendering the element containing the input fields */
    container: (props: any) => JSX.Element;
}

export default class MappedTextFields extends React.Component<MappedTextFieldsProps, MappedTextFieldsState> {
    constructor(props) {
        super(props);
        this.state = {
            isAddingKey: false,
            isEditing: false,
            newKey: ""
        };

        this.addNewKey = this.addNewKey.bind(this);
        this.updateText = this.updateText.bind(this);
        this.setEditing = this.setEditing.bind(this);
    }

    get data() {
        return this.props.value;
    }

    get editingButton() {
        const setAddingKey = (b: boolean) => this.setState({ isAddingKey: b });

        if (this.state.isEditing) {
            return (
                <>
                    <button onClick={() => setAddingKey(true)}>Add New Item</button>
                    <button onClick={() => this.setEditing(false)}>Done Editing</button>
                </>
            )
        }

        if (this.data.size == 0) {
            return <button onClick={() => this.setEditing(true)}>Add an item</button>
        }

        return <></>
    }

    addNewKey(key: string) {
        /** If an empty key is entered, assume this is because the user wants to stop editing
        if (key.length == 0) {
            this.setEditing(false);
            return;
        } */

        this.updateText(key, '');
        this.setState({
            isAddingKey: false,
            newKey: key
        });
    }

    updateText(key: string, value: string) {
        // Update parent
        this.props.updateValue(key, value);
    };

    setEditing(isEditing: boolean) {
        let isAddingKey = this.state.isAddingKey;
        if (isEditing === false) {
            isAddingKey = false;

            // Update parent
            // this.props.updateValue(this.data);
        }

        this.setState({
            isAddingKey: isAddingKey,
            isEditing: isEditing
        });
    }

    render() {
        let keyAdder = <></>
        if (this.state.isAddingKey && this.state.isEditing) {
            keyAdder = <tr>
                <th scope="row">
                <ValueField
                        isEditing={this.state.isEditing}
                        toggleParentEdit={() => this.setState({ isEditing: true })}
                        updateText={this.addNewKey}
                        suggestions={this.props.keySuggestions}
                    />
                </th>
                <td>
                    <input disabled />
                </td>
            </tr>
        }

        const Container = this.props.container;

        return <React.Fragment>
            <Container>
              {Array.from(this.data.entries()).map(([key, value]) => {
                return <tr key={key}>
                    <th onKeyDown={(event) => {
                        // When the user is done editing the value field, allow them
                        // to add another field
                        if (event.key === 'Enter') {
                            this.setState({ isAddingKey: true });
                    }}} scope="row">{key}</th><td><ValueField
                        isEditing={this.state.isEditing}
                        toggleParentEdit={() => this.setState({ isEditing: true })}
                        updateText={this.updateText.bind(this, key)}
                        value={value}
                        delete={() => {
                            this.props.deleteKey(key);
                        }}
                    />
                    </td>
                </tr>})}

                {keyAdder}
            </Container>

            <div>
                {this.editingButton}
            </div>
        </React.Fragment>
    }
}