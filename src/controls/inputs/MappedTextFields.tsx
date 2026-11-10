import React from "react";
import createUuid from "@/shared/utils/createUuid";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";
import { localKeyboardScopeAttributes } from "@/shared/ui/localKeyboardScope";
import { Button } from "@/controls/Buttons";
import Modal from "@/controls/Modal";

interface ValueFieldProps {
    label: string;
    value?: string;
    isEditing: boolean;
    updateText: (value: string) => void;
    suggestions?: Array<string>;
    getVariables?: () => string[];
    multiline?: boolean;
    isPropertyName?: boolean;
    delete?: () => void;
    validate?: (value: string) => string | undefined;
    /** Commit a blank value even when the field was never changed, then remove it. */
    discardUnchangedBlank?: boolean;
    /** Receives the focusable read-only value, so focus can return to it after editing. */
    displayRef?: React.Ref<HTMLButtonElement>;
    displaySuffix?: string;
}

interface ValueState {
    value: string;
    variables?: string[];
}

/** Buffers one mapped value while it is being edited. */
class ValueField extends React.Component<ValueFieldProps, ValueState> {
    private readonly errorId = createUuid();
    private readonly suggestionsId = createUuid();
    private readonly textarea = React.createRef<HTMLTextAreaElement>();
    private insertionCaret?: number;
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

    /**
     * Delete commits the removal itself. A later unmount must not save the draft,
     * and the click must not reach the row, which would reopen the removed field.
     */
    private deleteField(event: React.MouseEvent) {
        event.stopPropagation();
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
        if (blank && this.props.isPropertyName) return;
        if (unchanged && !(blank && this.props.discardUnchangedBlank)) return;
        if (!(blank && blankRemoves) && this.props.validate?.(next)) return;
        // A parent update can unmount the field before new props arrive. Record
        // the submitted draft first so that unmount cannot submit it twice.
        this.submittedValue = next;
        this.props.updateText(next);
    }

    keyDownHandler(event: React.KeyboardEvent) {
        if (this.state.variables || event.nativeEvent.isComposing) {
            event.stopPropagation();
            return;
        }
        if (event.key === 'Enter' && this.error) {
            if (this.props.multiline) event.preventDefault();
            event.stopPropagation();
        }
        if (event.key === 'Escape') {
            this.cancelSubmit = true;
            this.submittedValue = this.props.value || "";
            this.setState({ value: this.props.value || "" });
        }
    }

    private get error() {
        if (this.props.isPropertyName && !this.state.value.trim()) return;
        return this.props.validate?.(this.state.value);
    }

    private insertSuggestion(value: string, insertAtSelection: boolean) {
        const field = this.textarea.current;
        if (!field) return;
        const start = insertAtSelection ? field.selectionStart : 0;
        const end = insertAtSelection ? field.selectionEnd : field.value.length;
        const next = field.value.slice(0, start) + value + field.value.slice(end);
        this.insertionCaret = start + value.length;
        this.setState({ value: next, variables: undefined });
    }

    private renderSuggestions() {
        const { variables } = this.state;
        const suggestions = this.props.suggestions ?? [];
        return <>
            <Button type="button" aria-haspopup="dialog" onClick={() => this.setState({
                variables: (this.props.getVariables?.() ?? [])
                    .filter(value => value !== "var(" + this.props.label + ")")
            })}>
                Insert variable
            </Button>
            <Modal
                isOpen={variables !== undefined}
                title="Insert a CSS variable"
                className="css-suggestions-modal"
                close={() => this.setState({ variables: undefined })}
                onAfterClose={() => {
                    const caret = this.insertionCaret;
                    this.insertionCaret = undefined;
                    if (caret === undefined) return;
                    // React Modal returns focus to the trigger before this callback.
                    const field = this.textarea.current;
                    field?.focus();
                    field?.setSelectionRange(caret, caret);
                }}
            >
                <div {...localKeyboardScopeAttributes}>
                    {variables?.length ? <div className="css-suggestion-options app-gap-2">
                        {variables.map(value => <Button type="button" key={value} onClick={() => this.insertSuggestion(value, true)}>
                            <code>{value}</code>
                        </Button>)}
                    </div> : <p className="app-mt-0">No CSS variables are available for this rule.</p>}
                    {suggestions.length > 0 && <>
                        <h3 className="app-mb-2">Suggested values</h3>
                        <div className="css-suggestion-options app-gap-2">
                            {suggestions.map(value => <Button type="button" key={value} onClick={() => this.insertSuggestion(value, false)}>
                                <code>{value}</code>
                            </Button>)}
                        </div>
                    </>}
                </div>
            </Modal>
        </>;
    }

    render() {
        const error = this.error;
        const errorId = this.errorId;
        const feedback = error ? <span id={errorId} role="alert" className="input-validation-error">{error}</span> : null;
        const suggestions = this.props.suggestions && !this.props.multiline && (
            <datalist id={this.suggestionsId}>
                {this.props.suggestions.map(value => <option key={value} value={value} />)}
            </datalist>
        );

        if (this.props.isEditing) {
            const inputProps = {
                ...nonCredentialInputAttributes,
                autoFocus: true,
                "aria-label": this.props.label + " value",
                spellCheck: false,
                "aria-invalid": Boolean(error),
                "aria-describedby": error ? errorId : undefined,
                onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                    this.setState({ value: event.target.value }),
                value: this.state.value
            };
            // Escape from the input or its action buttons cancels the draft.
            return <span className="property-value-editor" onKeyDown={this.keyDownHandler}>
                {this.props.multiline ? <textarea {...inputProps} ref={this.textarea} rows={1} /> :
                    <input {...inputProps} list={suggestions ? this.suggestionsId : undefined} />}
                {suggestions}
                {this.props.getVariables && this.renderSuggestions()}
                {this.deleter}
                {feedback}
            </span>
        }

        // A real button keeps the declaration reachable by keyboard. Enter or Space
        // clicks it, and the row's click handler opens the editor.
        // The accessible name includes the visible text (WCAG 2.5.3, label in name).
        const display = this.state.value.length > 0 ? this.state.value : "Enter a value";
        return (
            <>
                <button
                    type="button"
                    ref={this.props.displayRef}
                    className="property-value-display"
                    aria-label={`Edit ${this.props.label}: ${display}`}
                >
                    <span>{display}</span>
                    {this.props.displaySuffix && <span aria-hidden="true">{this.props.displaySuffix}</span>}
                </button>
                {feedback}
            </>
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
    children?: React.ReactNode;
    addButtonRef: React.Ref<HTMLButtonElement>;
    onClick: (event: React.MouseEvent) => void;
}

export interface MappedTextFieldsProps {
    value: Map<string, string>;
    layout?: "table" | "declarations";
    updateValue: (key: string, value: string) => void;
    validateValue?: (key: string, value: string) => string | undefined;
    deleteKey: (key: string) => void;

    /** An array of text input suggestions for new keys */
    keySuggestions?: Array<string>;

    /** Value suggestions that apply to all keys */
    genericValueSuggestions?: Array<string>;
    getVariables?: () => string[];

    /** Mapping of keys to their respective value suggestions */
    valueSuggestions?: Map<string, Array<string>>;

    /**
     * Render prop for the element containing the input fields. It is called
     * directly during render, not mounted as a component, so it must not call hooks.
     */
    container: (props: ContainerProps) => React.ReactNode;
}

/** Edits a string map as independently selectable key/value fields. */
export default class MappedTextFields extends React.Component<MappedTextFieldsProps, MappedTextFieldsState> {
    /** Read-only value controls by property name, used to place focus after editing. */
    private readonly displays = new Map<string, HTMLButtonElement>();
    /**
     * Property names to focus, in order, once no field is editing. Closing an
     * editor unmounts its input; without this, focus falls to the document body,
     * where global résumé shortcuts would receive the next key.
     */
    private focusAfterEdit?: ReadonlyArray<string>;
    private readonly addButton = React.createRef<HTMLButtonElement>();

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
        this.restoreFocus();
    }

    /** Focus the first requested declaration that is still rendered. An opening editor keeps its own focus. */
    private restoreFocus() {
        if (this.state.activeKey || this.state.isAddingKey) {
            // A newly opened editor supersedes the request; a stale one must not
            // pull focus away when that editor later closes by other means.
            this.focusAfterEdit = undefined;
            return;
        }
        if (!this.focusAfterEdit) return;
        const target = this.focusAfterEdit.map(key => this.displays.get(key)).find(Boolean);
        this.focusAfterEdit = undefined;
        (target ?? this.addButton.current)?.focus();
    }

    /** Rendered property names, including a staged name that has no value yet. */
    private get rowKeys(): Array<string> {
        const keys = Array.from(this.data.keys());
        const pending = this.state.pendingKey;
        return pending && !this.data.has(pending) ? [...keys, pending] : keys;
    }

    /** Prefer the given row, then the rows after it, then the rows before it. Without a row, prefer the last. */
    private focusOrder(key?: string): Array<string> {
        const keys = this.rowKeys;
        const index = key ? keys.indexOf(key) : -1;
        if (index < 0) return keys.reverse();
        return [...keys.slice(index), ...keys.slice(0, index).reverse()];
    }

    addNewKey(key: string) {
        if (!key.trim()) {
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
            this.removeKey(key);
            return;
        }

        this.props.updateValue(key, value);
        this.dropPending(key);
    }

    /**
     * Remove a declaration, or drop it if it was only staged. Its row is about to
     * unmount, so focus moves to a neighbouring declaration instead.
     */
    private removeKey(key: string) {
        this.focusAfterEdit = this.focusOrder(key).filter(other => other !== key);
        if (this.state.activeKey === key) this.setState({ activeKey: '' });
        if (this.data.has(key)) this.props.deleteKey(key);
        this.dropPending(key);
    }

    /** Drop a property name that was never written into the CSS tree. */
    private dropPending(key: string) {
        if (this.state.pendingKey !== key) return;
        this.setState({ pendingKey: "" });
    }

    /** Keydown from a property row or the new-property row. */
    handleKeyDown(event: React.KeyboardEvent) {
        // With no editor open, focus rests on a value button. Enter there is the
        // button's own click, and Escape has nothing to cancel, so neither may
        // move focus or change state.
        if (!this.state.activeKey && !this.state.isAddingKey) return;

        switch (event.key) {
            case 'Escape':
                // The field cancels its own draft. A pending name was never stored,
                // so drop that row instead of leaving an empty declaration behind.
                this.focusAfterEdit = this.focusOrder(this.state.activeKey);
                this.setState((state) => ({
                    activeKey: '',
                    isAddingKey: false,
                    pendingKey: state.activeKey === state.pendingKey ? '' : state.pendingKey
                }));
                break;
            case 'Enter':
                // Enter on a button (a value or Delete) is left to that button.
                if (!(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) break;
                // Enter in an input closes the editor; the field commits its draft as
                // it leaves edit mode. An invalid draft stops Enter before it gets here.
                // Enter does not open the next declaration, but a new property name
                // still continues to that property's value. Focus moves to the value
                // button during this keydown, so the default action must not click it.
                event.preventDefault();
                this.focusAfterEdit = this.focusOrder(this.state.activeKey);
                this.setState({ activeKey: '', isAddingKey: false });
                break;
        }
    }

    /**
     * Props for anything containing an input cell. Rows own their keyboard input,
     * so global selected-node shortcuts ignore keys pressed in them.
     */
    inputContainerProps(key?: string) {
        let props: any = {
            ...localKeyboardScopeAttributes,
            onClick: (event: React.MouseEvent) => {
                event.stopPropagation();
            },
            onKeyDown: this.handleKeyDown
        };

        if (key) {
            const oldProps = { ...props };
            props.onClick = (event: React.MouseEvent) => {
                oldProps.onClick(event);
                if (!event.currentTarget.contains(event.target as Node)) return;
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
        const Row = this.props.layout === "declarations" ? "div" : "tr";
        const Key = this.props.layout === "declarations" ? "span" : "th";
        const Value = this.props.layout === "declarations" ? "span" : "td";
        return (
            <Row className="property" key={key} {...this.inputContainerProps(key)}>
                <Key className={this.props.layout === "declarations" ? "property-key" : "property-key app-pr-3"}>{key}</Key>
                {this.props.layout === "declarations" ? ": " : null}
                <Value className="property-value">
                    <ValueField
                        label={key}
                        isEditing={this.state.activeKey === key}
                        updateText={this.updateText.bind(this, key)}
                        value={value}
                        suggestions={this.suggestionsFor(key)}
                        multiline={this.props.layout === "declarations"}
                        getVariables={this.props.getVariables}
                        validate={draft => this.props.validateValue?.(key, draft)}
                        discardUnchangedBlank={pending}
                        displaySuffix={this.props.layout === "declarations" && !pending ? ";" : undefined}
                        displayRef={(element) => {
                            if (element) this.displays.set(key, element);
                            else this.displays.delete(key);
                        }}
                        delete={() => this.removeKey(key)} />
                </Value>
            </Row>
        );
    }
    
    render() {
        let keyAdder = <></>
        if (this.state.isAddingKey) {
            const Row = this.props.layout === "declarations" ? "div" : "tr";
            const Key = this.props.layout === "declarations" ? "span" : "th";
            keyAdder = <Row>
                <Key {...this.inputContainerProps()}>
                    <ValueField
                        label="New property name"
                        isPropertyName
                        isEditing={this.state.isAddingKey}
                        updateText={this.addNewKey}
                        suggestions={this.props.keySuggestions}
                        validate={key => this.props.validateValue?.(key, '')}
                    />
                </Key>
                {this.props.layout !== "declarations" && <td><input disabled /></td>}
            </Row>
        }

        // Call the render prop rather than mounting it as a component. Callers pass
        // a new function on each render, and a new component type would remount
        // every row, discarding the focus restored after an edit.
        return <React.Fragment>
            {this.props.container({
                onClick: () => this.setState({ activeKey: "", isAddingKey: true }),
                addButtonRef: this.addButton,
                children: <>
                    {/* A staged row shares the stored rows' list, so it keeps its
                        identity, and focus, when its first value is stored. */}
                    {this.rowKeys.map(key => this.renderPropertyRow(key, this.data.get(key) ?? "", !this.data.has(key)))}

                    {keyAdder}
                </>
            })}
        </React.Fragment>
    }
}
