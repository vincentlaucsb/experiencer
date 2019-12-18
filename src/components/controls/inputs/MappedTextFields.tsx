// TODO: This whole file is a strong candidate for refactoring/testing when time is available

import React from "react";

interface MappedTextFieldsState {
    isAddingKey: boolean;
    isEditing: boolean;
    displayMap: Map<string, string>;
    newKey: string;
}

interface ValueFieldProps {
    value?: string;
    isEditing: boolean;
    updateText: (value: string) => void;
    shouldFocus: boolean;
    toggleParentEdit: () => void;
}

function ValueField(props: ValueFieldProps) {
    let [value, updateValue] = React.useState(props.value || "");
    let [isEditing, setEditing] = React.useState(props.isEditing);
    let [initialMount, setInitialMount] = React.useState(false);

    /** This field will automatically be in an editing state when it first mounts
     *  if shouldFocus is true
     */
    if (props.shouldFocus && !initialMount) {
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

    if (isEditing) {
        return <input autoFocus={props.shouldFocus} onChange={(event) => updateValue(event.target.value)}
            onKeyDown={onKeyDown}
            value={value}
        />
    }

    return (
        <span onClick={onClick}>
            {value.length > 0 ? value : "Enter a value"}
        </span>
    );
}

export interface MappedTextFieldsProps {
    value: Map<string, string>;
    updateValue: (value: Map<string, string>) => void;
}

export default class MappedTextFields extends React.Component<MappedTextFieldsProps, MappedTextFieldsState> {
    // Temporary holding buffer that gets modified by reference
    // for efficiency
    data: Map<string, string>;

    constructor(props) {
        super(props);

        this.data = props.value;

        this.state = {
            isAddingKey: false,
            isEditing: false,

            newKey: "",

            // Actual map that gets rendered
            displayMap: new Map<string, string>(props.value),
        };

        this.addNewKey = this.addNewKey.bind(this);
        this.updateText = this.updateText.bind(this);
        this.setEditing = this.setEditing.bind(this);
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

        return (
            <button onClick={() => this.setState({ isEditing: true })}>Edit</button>
        );
    }

    addNewKey(key: string) {
        /** If an empty key is entered, assume this is because the user wants to stop editing */
        if (key.length == 0) {
            this.setEditing(false);
            return;
        }

        this.updateText(key, '');
        this.setState({
            isAddingKey: false,
            newKey: key
        });
    }

    updateText(key: string, value: string) {
        this.data.set(key, value);
        this.setState({ displayMap: this.data });

        // Update parent
        this.props.updateValue(this.data);
    };

    setEditing(isEditing: boolean) {
        let isAddingKey = this.state.isAddingKey;
        if (isEditing === false) {
            isAddingKey = false;

            // Update parent
            this.props.updateValue(this.data);
        }

        this.setState({
            isAddingKey: isAddingKey,
            isEditing: isEditing
        });
    }

    render() {
        let keyAdder = <></>
        if (this.state.isAddingKey && this.state.isEditing) {
            keyAdder = <li>
                <ValueField
                    isEditing={this.state.isEditing}
                    toggleParentEdit={() => this.setState({ isEditing: true })}
                    shouldFocus={true} updateText={this.addNewKey} /> <input disabled />
            </li>
        }

        return <React.Fragment>
            <ul>
            {Array.from(this.state.displayMap.entries()).map(([key, value]) => {
                const shouldFocus = key === this.state.newKey;

                return <li key={key}>
                    <div onKeyDown={(event) => {
                        // When the user is done editing the value field, allow them
                        // to add another field
                        if (event.key === 'Enter') {
                            this.setState({ isAddingKey: true });
                    }}}>{key}: <ValueField
                        isEditing={this.state.isEditing}
                        toggleParentEdit={() => this.setState({ isEditing: true })}
                        updateText={this.updateText.bind(this, key)}
                        value={value}
                        shouldFocus={shouldFocus} />
                    </div>
                </li>})}

                {keyAdder}
            </ul>

            <div>
                {this.editingButton}
            </div>
        </React.Fragment>
    }
}