import React, { MouseEvent } from "react";
import { isNullOrUndefined } from "util";

interface TextFieldProps {
    value?: string;
    label?: string;
    defaultText?: string;
    displayClassName?: string;
    displayValue?: string;
    static?: boolean;

    /** Callback to modify the text field */
    moveUp?: () => void;
    moveDown?: () => void;
    delete?: () => void;

    /** A callback which modifies the display text */
    displayProcessors?: ((text?: string) => string)[];
    onChange: (text: string) => void;
}

export interface TextFieldState {
    value: string;
    isEditing: boolean;
}

export default class TextField extends React.Component<TextFieldProps, TextFieldState> {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            isEditing: false
        };

        this.onKeyDown = this.onKeyDown.bind(this);
    }

    get editControls() {
        const moveUp = this.props.moveUp as () => void;
        const moveDown = this.props.moveDown as () => void;
        const deleter = this.props.delete as () => void;
        let moveUpButton = <></>
        let moveDownButton = <></>
        let deleteButton = <></>

        if (moveUp) {
            moveUpButton = (
                <button
                    onClick={(event: React.MouseEvent) => {
                        moveUp();
                        event.stopPropagation();
                    }}
                ><i className="icofont-arrow-up" /></button>
            );
        }

        if (moveDown) {
            moveDownButton = (
                <button
                    onClick={(event: React.MouseEvent) => {
                        moveDown();
                        event.stopPropagation();
                    }}
                ><i className="icofont-arrow-down" /></button>
            );
        }

        if (deleter) {
            deleteButton = (
                <button
                    onClick={(event: React.MouseEvent) => {
                        deleter();
                        event.stopPropagation();
                    }}
                ><i className="icofont-ui-delete" /></button>
            );
        }

        return <>
            {moveUpButton}
            {moveDownButton}
            {deleteButton}
        </>
    }

    /** Update parent when appropriate */
    componentDidUpdate(prevProps: TextFieldProps) {
        /** Top level node gave us new data */
        if (this.props.static && this.state.isEditing) {
            this.setState({ isEditing: false });
        }

        if (!this.state.isEditing) {
            if (prevProps.value !== this.props.value) {
                // Parent updated us
                this.setState({
                    value: this.props.value || ""
                });
            } else if (this.state.value &&
                this.state.value !== this.props.value) {
                // Update parent
                this.props.onChange(this.state.value);
            }
        }
    }
    
    onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            this.setState({ isEditing: false });
            this.props.onChange(this.state.value);
        }
        else if (event.key === 'Escape') {
            // Restore original value
            this.setState({
                isEditing: false,
                value: this.props.value || ''
            });
        }
    };

    render() {
        const props = this.props;

        let label = <></>
        if (props.label) {
            label = <label>{props.label || "Value"}</label>
        }

        if (this.state.isEditing) {
            return <span
                onBlur={(event: React.FocusEvent) => {
                    // Avoid triggering event if delete button
                    //w as clicked
                    if (isNullOrUndefined(event.relatedTarget)) {
                        this.setState({ isEditing: false });
                    }
                }}>
                {label}
                <input
                    autoFocus
                    onChange={(event) => this.setState({ value: event.target.value })}
                    onKeyDown={this.onKeyDown}
                    value={this.state.value}
                />
                {this.editControls}
            </span>
        }

        let displayValue = props.displayValue || props.value || props.defaultText || "";
        if (displayValue.length > 0) {
            // Apply processing functions to the display value, if applicable
            if (props.displayProcessors) {
                props.displayProcessors.forEach((fn) => {
                    displayValue = fn(displayValue);
                }); 
            }
        }
        else {
            displayValue = "Enter a value";
        }

        return (
            <span
                onClick={(event: MouseEvent) => {
                    if (!this.props.static) {
                        this.setState({ isEditing: true });
                    }
                }}

                className={props.displayClassName}
                dangerouslySetInnerHTML={{ __html: displayValue }}
            />
        );
    }
}