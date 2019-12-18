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

    if (props.shouldFocus && !initialMount) {
        setEditing(true);
        setInitialMount(true);
    }

    React.useEffect(() => {
        // When the parent tells this to stop editing, then stop editing
        if (!props.isEditing && isEditing) {
            setEditing(false);
        }
    }, [props.isEditing]);

    const onClick = (event: React.MouseEvent<HTMLSpanElement>) => {
        setEditing(true);

        if (!props.isEditing) {
            props.toggleParentEdit();
        }
    }

    const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            setEditing(false);

            // Update parent
            props.updateText(value);
        }
    }

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

export default class MappedTextFields extends React.Component<{}, MappedTextFieldsState> {
    // Temporary holding buffer that gets modified by reference
    // for efficiency
    data = new Map<string, string>();

    constructor(props) {
        super(props);

        this.state = {
            isAddingKey: false,
            isEditing: false,

            newKey: "",

            // Actual map that gets rendered
            displayMap: new Map<string, string>(),
        };
    }

    get editingButton() {
        const setAddingKey = (b: boolean) => this.setState({ isAddingKey: b });

        if (this.state.isEditing) {
            return (
                <>
                    <button onClick={() => setAddingKey(true)}>Add New Item</button>
                    <button onClick={() => this.setState({ isEditing: false })}>Done Editing</button>
                </>
            )
        }

        return (
            <button onClick={() => this.setState({ isEditing: true })}>Edit</button>
        );
    }

    setEditing(isEditing: boolean) {
        let isAddingKey = this.state.isAddingKey;
        if (isEditing === false) {
            isAddingKey = false;
        }

        this.setState({
            isAddingKey: isAddingKey,
            isEditing: isEditing
        });
    }

    render() {
        const setDisplayMap = (data: Map<string, string>) => this.setState({ displayMap: data });
        const addNewKey = (key: string) => {
            this.data.set(key, '');
            this.setState({
                displayMap: this.data,
                isAddingKey: false,
                newKey: key
            });
        }

        let keyAdder = <></>
        if (this.state.isAddingKey && this.state.isEditing) {
            keyAdder = <>
                <ValueField
                    isEditing={this.state.isEditing}
                    toggleParentEdit={() => this.setState({ isEditing: true })}
                    shouldFocus={true} updateText={addNewKey} /> <input disabled />
            </>
        }

        const updateText = (key: string, value: string) => {
            this.data.set(key, value);
            setDisplayMap(this.data);
        };

        return <React.Fragment>
            {Array.from(this.state.displayMap.entries()).map(([key, value]) => {
                const shouldFocus = key === this.state.newKey;

                return <React.Fragment key={key}>
                    <div onKeyDown={(event) => {
                            // When the user is done editing the value field, allow them
                            // to add another field
                            if (event.key === 'Enter') {
                                this.setState({ isAddingKey: true });
                        }
                    }}>
                        {key}
                        <ValueField
                            isEditing={this.state.isEditing}
                            toggleParentEdit={() => this.setState({ isEditing: true })}
                            updateText={updateText.bind(this, key)}
                            value={value}
                            shouldFocus={shouldFocus}
                        />
                    </div>
                </React.Fragment>
            }
            )}

            {keyAdder}

            <div>
                {this.editingButton}
            </div>
        </React.Fragment>
    }
}