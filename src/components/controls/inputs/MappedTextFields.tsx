import React from "react";
import uuid from 'uuid/v4';

interface ValueFieldProps {
    value?: string;
    isEditing: boolean;
    updateText: (value: string) => void;
    suggestions?: Array<string>;
    delete?: () => void;
}

interface ValueState {
    value: string;
}

class ValueField extends React.Component<ValueFieldProps, ValueState> {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value || ''
        };

        this.keyDownHandler = this.keyDownHandler.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.isEditing && prevProps.isEditing !== this.props.isEditing) {
            if (this.props.value !== this.state.value) {
                this.props.updateText(this.state.value);
            }
        }
    }

    componentWillUnmount() {
        if (this.props.value !== this.state.value) {
            this.props.updateText(this.state.value);
        }
    }

    keyDownHandler(event: React.KeyboardEvent) {
        if (event.key === 'Escape') {
            // Restore original value
            this.setState({ value: this.props.value || "" });
        }
    }

    render() {
        let suggestions = <></>
        let suggestionId = "";
        if (this.props.suggestions) {
            suggestionId = uuid();
            suggestions = (<datalist id={suggestionId}>
                {this.props.suggestions.map((value) => <option value={value} />)}
            </datalist>
            );
        }

        if (this.props.isEditing) {
            return <>
                <input autoFocus onChange={(event) => this.setState({ value: event.target.value })}
                    onKeyDown={this.keyDownHandler}
                    value={this.state.value}
                    list={suggestionId}
                />
                {suggestions}
                <button onClick={this.props.delete}>Delete</button>
            </>
        }

        return (
            <span>{this.state.value.length > 0 ? this.state.value : "Enter a value"}</span>
        );
    }
}

interface MappedTextFieldsState {
    activeKey: string;
    isAddingKey: boolean;
    isEditing: boolean;
}

export interface MappedTextFieldsProps {
    value: Map<string, string>;
    updateValue: (key: string, value: string) => void;
    deleteKey: (key: string) => void;

    /** An array of text input suggestions for new keys */
    keySuggestions?: Array<string>;

    /** Mapping of keys to their respective value suggestions */
    valueSuggestions?: Map<string, Array<string>>;

    /** Render prop for rendering the element containing the input fields */
    container: (props: any) => JSX.Element;
}

export default class MappedTextFields extends React.Component<MappedTextFieldsProps, MappedTextFieldsState> {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: "",
            isAddingKey: false,
            isEditing: false
        };

        this.addNewKey = this.addNewKey.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
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
        this.updateText(key, '');
        this.setState({
            isAddingKey: false,
            activeKey: key
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

    /**
     * Keydown from an input field
     * @param event
     */
    handleKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
            case 'Enter':
                this.setState({ activeKey: '' });
                this.setState({ isAddingKey: false });
                break;
        }
    }

    /** Props for anything containing an input cell */
    inputContainerProps(key?: string) {
        let props: any = {
            onKeyDown: this.handleKeyDown
        };

        if (key) {
            props.onClick = () => this.setState({ activeKey: key });
        }

        return props;
    }

    render() {
        let keyAdder = <></>
        if (this.state.isAddingKey && this.state.isEditing) {
            keyAdder = <tr>
                <th scope="row" {...this.inputContainerProps()}>
                <ValueField
                        isEditing={this.state.isAddingKey}
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
                    let suggestions;
                    if (this.props.valueSuggestions && this.props.valueSuggestions.has(key)) {
                        suggestions = this.props.valueSuggestions.get(key);
                    }

                return <tr key={key}>
                    <th onKeyDown={(event) => {
                        // When the user is done editing the value field, allow them
                        // to add another field
                        if (event.key === 'Enter') {
                            this.setState({ isAddingKey: true });
                        }
                    }} scope="row">{key}</th>
                    <td {...this.inputContainerProps(key)}>
                        <ValueField
                            isEditing={this.state.activeKey === key}
                            updateText={this.updateText.bind(this, key)}
                            value={value}
                            suggestions={suggestions}
                            delete={() => { this.props.deleteKey(key); }} />
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