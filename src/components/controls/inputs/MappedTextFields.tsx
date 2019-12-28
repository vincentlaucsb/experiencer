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

    get deleter() {
        return (this.props.delete) ? <button onClick={this.props.delete}>Delete</button> :
            <></>
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
                {this.props.suggestions.map((value) =>
                    <option key={value} value={value} />)}
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
                {this.deleter}
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
}

export interface ContainerProps {
    children?: any;
    onClick: (event: React.MouseEvent) => void;
}

export interface MappedTextFieldsProps {
    value: Map<string, string>;
    updateValue: (key: string, value: string) => void;
    deleteKey: (key: string) => void;

    /** An array of text input suggestions for new keys */
    keySuggestions?: Array<string>;

    /** Value suggestions that apply to all keys */
    genericValueSuggestions?: Array<string>;

    /** Mapping of keys to their respective value suggestions */
    valueSuggestions?: Map<string, Array<string>>;

    /** Render prop for rendering the element containing the input fields */
    container: (props: ContainerProps) => JSX.Element;
}

export default class MappedTextFields extends React.Component<MappedTextFieldsProps, MappedTextFieldsState> {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: "",
            isAddingKey: false
        };

        this.addNewKey = this.addNewKey.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.updateText = this.updateText.bind(this);
    }

    get data() {
        return this.props.value;
    }

    componentDidUpdate(prevProps, prevState: MappedTextFieldsState) {
        /** Prevent two text inputs from being active at once */
        if (this.state.isAddingKey && this.state.activeKey) {
            if (prevState.isAddingKey) {
                this.setState({ isAddingKey: false });
            }
            else {
                this.setState({ activeKey: '' });
            }
        }
    }

    addNewKey(key: string) {
        if (key.length > 0) {
            this.updateText(key, '');
        }

        this.setState({
            isAddingKey: false,
            activeKey: key
        });
    }

    updateText(key: string, value: string) {
        // Update parent
        this.props.updateValue(key, value);
    };

    /**
     * Keydown from an input field
     * @param event
     */
    handleKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                this.setState({ activeKey: '' });
                this.setState({ isAddingKey: false });
                break;
            case 'Enter':
                if (this.state.isAddingKey) {
                    this.setState({ isAddingKey: false });
                    return;
                }

                const currentKey = this.state.activeKey;
                const keys = this.props.value.keys();

                // Get key after the current one
                let nextUp = false;
                for (let k of keys) {
                    if (k === currentKey) {
                        nextUp = true;
                    }
                    else if (nextUp) {
                        this.setState({ activeKey: k });
                        return;
                    }
                }

                this.setState({
                    activeKey: '',
                    isAddingKey: true
                });
                break;
        }
    }

    /** Props for anything containing an input cell */
    inputContainerProps(key?: string) {
        let props: any = {
            onClick: (event: React.MouseEvent) => {
                event.stopPropagation();
            },
            onKeyDown: this.handleKeyDown
        };

        if (key) {
            const oldProps = { ...props };
            props.onClick = (event: React.MouseEvent) => {
                oldProps.onClick(event);
                this.setState({ activeKey: key });
            }
        }

        return props;
    }
    
    render() {
        let keyAdder = <></>
        if (this.state.isAddingKey) {
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
            <Container onClick={(event) => {
                this.setState({ isAddingKey: true });
            }}>
                {Array.from(this.data.entries()).map(([key, value]) => {
                    let suggestions = this.props.genericValueSuggestions || [];
                    if (this.props.valueSuggestions && this.props.valueSuggestions.has(key)) {
                        suggestions = suggestions.concat(
                            this.props.valueSuggestions.get(key) || []);
                    }

                    return (
                        <tr className="property"
                            key={key} {...this.inputContainerProps(key)}>
                            <th className="property-key">{key}</th>
                            <td className="property-value">
                                <ValueField
                                    isEditing={this.state.activeKey === key}
                                    updateText={this.updateText.bind(this, key)}
                                    value={value}
                                    suggestions={suggestions}
                                    delete={() => { this.props.deleteKey(key); }} />
                            </td>
                        </tr>
                    );
                })}

                {keyAdder}
            </Container>
        </React.Fragment>
    }
}