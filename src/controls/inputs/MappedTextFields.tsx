import React from "react";
import createUuid from "@/shared/utils/createUuid";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import { Button } from "@/controls/Buttons";

interface ValueFieldProps {
    label: string;
    value?: string;
    isEditing: boolean;
    updateText: (value: string) => void;
    suggestions?: Array<string>;
    delete?: () => void;
    validate?: (value: string) => string | undefined;
    /** Commit a blank value even when the field was never changed, then remove it. */
    discardUnchangedBlank?: boolean;
}

interface ValueState {
    value: string;
}

/** Buffers one mapped value while it is being edited. */
class ValueField extends React.Component<ValueFieldProps, ValueState> {
    private readonly errorId = createUuid();
    private submittedValue: string;
    /** Escape cancels the in-progress draft. Unmount must not submit the text it replaced. */
    private cancelSubmit = false;

    constructor(props) {
        super(props);

        this.state = {
            value: props.value || ''
        };
        this.submittedValue = props.value || '';

        this.keyDownHandler = this.keyDownHandler.bind(this);
        this.deleteField = this.deleteField.bind(this);
    }

    get deleter() {
        return (this.props.delete) ? <Button
            aria-label={`Delete property ${this.props.label}`}
            variant="error"
            onClick={this.deleteField}
        >
            <i className="icofont-ui-delete" />
        </Button> :
            <></>
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.value !== this.props.value) {
            this.submittedValue = this.props.value || '';
            this.setState({ value: this.props.value || '' });
            return;
        }
        if (prevProps.isEditing && prevProps.isEditing !== this.props.isEditing) {
            this.submitDraft();
        }
    }

    componentWillUnmount() {
        this.submitDraft();
    }

    /** Delete commits the removal itself. A later unmount must not save the draft. */
    private deleteField() {
        this.submittedValue = this.state.value;
        this.props.delete?.();
    }

    private submitDraft() {
        if (this.cancelSubmit) {
            this.cancelSubmit = false;
            return;
        }
        const next = this.state.value;
        const blank = next.trim().length === 0;
        const unchanged = next === this.submittedValue;
        const blankRemoves = Boolean(this.props.delete) || Boolean(this.props.discardUnchangedBlank);
        if (unchanged && !(blank && this.props.discardUnchangedBlank)) return;
        if (!(blank && blankRemoves) && this.props.validate?.(next)) return;
        // A parent update can unmount the field before new props arrive. Record
        // the submitted draft first so that unmount cannot submit it twice.
        this.submittedValue = next;
        this.props.updateText(next);
    }

    keyDownHandler(event: React.KeyboardEvent) {
        if (event.key === 'Enter' && this.props.validate?.(this.state.value)) {
            event.stopPropagation();
        }
        if (event.key === 'Escape') {
            this.cancelSubmit = true;
            this.submittedValue = this.props.value || "";
            this.setState({ value: this.props.value || "" });
        }
    }

    render() {
        const error = this.props.validate?.(this.state.value);
        const errorId = this.errorId;
        const feedback = error ? <span id={errorId} role="alert" className="input-validation-error">{error}</span> : null;
        let suggestions = <></>
        let suggestionId = "";
        if (this.props.suggestions) {
            suggestionId = createUuid();
            suggestions = (<datalist id={suggestionId}>
                {this.props.suggestions.map((value) =>
                    <option key={value} value={value} />)}
            </datalist>
            );
        }

        if (this.props.isEditing) {
            // The wrapper, not only the text input, must see Escape. The delete
            // button is in this field, and a row-level Escape ends editing.
            return <span className="property-value-editor" onKeyDown={this.keyDownHandler}>
                <input
                    {...nonCredentialInputAttributes}
                    autoFocus
                    aria-label={`${this.props.label} value`}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) => this.setState({ value: event.target.value })}
                    value={this.state.value}
                    list={suggestionId}
                />
                {suggestions}
                {this.deleter}
                {feedback}
            </span>
        }

        return (
            <><span>{this.state.value.length > 0 ? this.state.value : "Enter a value"}</span>{feedback}</>
        );
    }
}

interface MappedTextFieldsState {
    activeKey: string;
    isAddingKey: boolean;
    /** Name staged locally until a non-blank value is committed. */
    pendingKey: string;
}

export interface ContainerProps {
    children?: any;
    onClick: (event: React.MouseEvent) => void;
}

export interface MappedTextFieldsProps {
    value: Map<string, string>;
    updateValue: (key: string, value: string) => void;
    validateValue?: (key: string, value: string) => string | undefined;
    deleteKey: (key: string) => void;

    /** An array of text input suggestions for new keys */
    keySuggestions?: Array<string>;

    /** Value suggestions that apply to all keys */
    genericValueSuggestions?: Array<string>;

    /** Mapping of keys to their respective value suggestions */
    valueSuggestions?: Map<string, Array<string>>;

    /** Render prop for rendering the element containing the input fields */
    container: (props: ContainerProps) => React.ReactNode;
}

/** Edits a string map as independently selectable key/value fields. */
export default class MappedTextFields extends React.Component<MappedTextFieldsProps, MappedTextFieldsState> {
    constructor(props) {
        super(props);
        this.state = {
            activeKey: "",
            isAddingKey: false,
            pendingKey: ""
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
        if (key.length === 0) {
            this.setState({ isAddingKey: false });
            return;
        }

        // Re-entering an existing name focuses that declaration. It must not
        // clear the saved value, which would remove the declaration.
        if (this.data.has(key)) {
            this.setState({ isAddingKey: false, activeKey: key, pendingKey: "" });
            return;
        }

        this.setState({
            isAddingKey: false,
            activeKey: key,
            pendingKey: key
        });
    }

    updateText(key: string, value: string) {
        if (value.trim().length === 0) {
            if (this.data.has(key)) this.props.deleteKey(key);
            this.dropPending(key);
            return;
        }

        this.props.updateValue(key, value);
        this.dropPending(key);
    }

    /** Drop a property name that was never written into the CSS tree. */
    private dropPending(key: string) {
        if (this.state.pendingKey !== key) return;
        this.setState({ pendingKey: "" });
    }

    /**
     * Keydown from an input field
     * @param event
     */
    handleKeyDown(event: React.KeyboardEvent) {
        switch (event.key) {
            case 'Escape':
                // The field cancels its own draft. A pending name was never stored,
                // so drop that row instead of leaving an empty declaration behind.
                this.setState((state) => ({
                    activeKey: '',
                    isAddingKey: false,
                    pendingKey: state.activeKey === state.pendingKey ? '' : state.pendingKey
                }));
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

    private suggestionsFor(key: string) {
        let suggestions = this.props.genericValueSuggestions || [];
        if (this.props.valueSuggestions && this.props.valueSuggestions.has(key)) {
            suggestions = suggestions.concat(this.props.valueSuggestions.get(key) || []);
        }
        return suggestions;
    }

    private renderPropertyRow(key: string, value: string, pending: boolean) {
        return (
            <tr className="property" key={key} {...this.inputContainerProps(key)}>
                <th className="property-key app-pr-3">{key}</th>
                <td className="property-value">
                    <ValueField
                        label={key}
                        isEditing={this.state.activeKey === key}
                        updateText={this.updateText.bind(this, key)}
                        value={value}
                        suggestions={this.suggestionsFor(key)}
                        validate={draft => this.props.validateValue?.(key, draft)}
                        discardUnchangedBlank={pending}
                        delete={() => {
                            if (pending) this.dropPending(key);
                            else this.props.deleteKey(key);
                        }} />
                </td>
            </tr>
        );
    }
    
    render() {
        let keyAdder = <></>
        if (this.state.isAddingKey) {
            keyAdder = <tr>
                <th scope="row" className="app-pr-3" {...this.inputContainerProps()}>
                    <ValueField
                        label="New property name"
                        isEditing={this.state.isAddingKey}
                        updateText={this.addNewKey}
                        suggestions={this.props.keySuggestions}
                        validate={key => this.props.validateValue?.(key, '')}
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
                {Array.from(this.data.entries()).map(([key, value]) => this.renderPropertyRow(key, value, false))}
                {this.state.pendingKey && !this.data.has(this.state.pendingKey)
                    ? this.renderPropertyRow(this.state.pendingKey, "", true)
                    : null}

                {keyAdder}
            </Container>
        </React.Fragment>
    }
}
