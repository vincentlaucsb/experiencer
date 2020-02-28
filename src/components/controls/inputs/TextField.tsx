import React, { MouseEvent } from "react";
import uuid from 'uuid/v4';
import parse from 'html-react-parser';
import { isNullOrUndefined } from "util";
import { ContextMenu, ContextMenuTrigger, MenuItem } from "react-contextmenu";
import ReactDOM from "react-dom";

import { createContainer } from "../../Helpers";

interface ContextMenuOption {
    text: string;
    action: () => void;
}

interface TextFieldProps {
    value?: string;
    label?: string;
    defaultText?: string;
    displayClassName?: string;
    displayValue?: string;
    static?: boolean;

    contextMenuOptions?: Array<ContextMenuOption>;
    
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
                    // was clicked
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
            </span>
        }

        let displayValue = props.displayValue || props.value || props.defaultText || "";
        if (displayValue.length > 0) {
            if (props.displayProcessors) {
                props.displayProcessors.forEach((fn) => {
                    displayValue = fn(displayValue);
                }); 
            }
        }
        else {
            displayValue = "Enter a value";
        }

        const contextMenuContainer = createContainer("context-menu-container");
        const contextMenuOptions = this.props.contextMenuOptions ?
            this.props.contextMenuOptions.map((option, index: number) => {
            return (
                <MenuItem onClick={option.action} key={index}>{option.text}</MenuItem>
            )
        }) : <></>;

        const menuId = uuid();
        return (
            <>
                {ReactDOM.createPortal(<ContextMenu id={menuId}>
                    <h3>Text Field</h3>
                    <MenuItem onClick={() => this.setState({ isEditing: true })}>Edit</MenuItem>
                    {contextMenuOptions}
                </ContextMenu>, contextMenuContainer)}
                <ContextMenuTrigger
                    attributes={{
                        onClick: (event: MouseEvent) => {
                            if (!this.props.static) {
                                this.setState({ isEditing: true });
                            }
                        },
                        className: props.displayClassName,
                    }}
                    id={menuId} renderTag="span">
                    {parse(displayValue)}
                </ContextMenuTrigger>
            </>
        );
    }
}