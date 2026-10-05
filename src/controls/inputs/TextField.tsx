import React, { MouseEvent } from "react";
import { ContextMenu } from "@popright/react";
import type { MenuItem } from "popright";
import InlineMarkdown from "@/resume/helpers/InlineMarkdown";
import useAutoExpandInput from "@/resume/hooks/useAutoExpandInput";

import { isNullOrUndefined } from "@/shared/utils/isNullOrUndefined";
import { nonCredentialInputAttributes } from "@/shared/ui/nonCredentialInputAttributes";

interface ContextMenuOption {
    text: string;
    onClick: () => void;
}

interface TextFieldProps {
    value?: string;
    label?: string;
    id?: string;
    ariaLabel?: string;
    defaultText?: string;
    /** Start the newly-created field in edit mode. */
    startEditing?: boolean;
    displayClassName?: string;
    displayValue?: string;
    static?: boolean;
    /** Expand the inline editor to fit its value; opt out only for fixed-width utility fields. */
    autoExpand?: boolean;
    /** Render the stored value only. Empty read-only fields stay empty instead of showing an editing hint. */
    readOnly?: boolean;

    contextMenuOptions?: Array<ContextMenuOption>;
    
    /** A callback which modifies the display text */
    displayProcessors?: ((text?: string) => string)[];
    onChange: (text: string) => void;
}

export interface TextFieldState {
    value: string;
    isEditing: boolean;
}

function AutoExpandInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    useAutoExpandInput(inputRef);

    return <input {...props} ref={inputRef} />;
}

/** Switches resume text between rendered Markdown and an inline editing control. */
export default class TextField extends React.Component<TextFieldProps, TextFieldState> {
    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            isEditing: Boolean(props.startEditing)
        };

        this.onKeyDown = this.onKeyDown.bind(this);
    }

    /**
     * The draft most recently offered to `onChange`. The parent may reject it and
     * keep its value, so a later unrelated render must not offer the same draft
     * again. A new edit session clears it, so the user can retry.
     */
    private submittedDraft: string | undefined;

    private submit(value: string) {
        this.submittedDraft = value;
        this.props.onChange(value);
    }

    /** Update parent when appropriate */
    componentDidUpdate(prevProps: TextFieldProps, prevState: TextFieldState) {
        if (this.state.isEditing && !prevState.isEditing) {
            this.submittedDraft = undefined;
        }

        /** Top level node gave us new data */
        if (this.props.static && this.state.isEditing) {
            // Save local changes before stopping edit mode
            if (this.state.value !== this.props.value) {
                this.submit(this.state.value);
            }
            this.setState({ isEditing: false });
        }

        if (!this.state.isEditing) {
            if (prevProps.value !== this.props.value) {
                // Parent updated us
                this.setState({
                    value: this.props.value || ""
                });
            } else if (this.state.value &&
                this.state.value !== this.props.value &&
                this.state.value !== this.submittedDraft) {
                // Update parent
                this.submit(this.state.value);
            }
        }
    }

    onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
        if (event.key === 'Enter') {
            this.setState({ isEditing: false });
            this.submit(this.state.value);
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

        if (props.readOnly) {
            let displayValue = props.displayValue || props.value || "";
            if (displayValue.length > 0 && props.displayProcessors) {
                props.displayProcessors.forEach((fn) => {
                    displayValue = fn(displayValue);
                });
            }
            return <span className={props.displayClassName}><InlineMarkdown>{displayValue}</InlineMarkdown></span>;
        }

        let label = <></>
        if (props.label) {
            label = <label htmlFor={props.id}>{props.label || "Value"}</label>
        }

        if (this.state.isEditing) {
            const inputProps = {
                ...nonCredentialInputAttributes,
                autoFocus: true,
                id: props.id,
                "aria-label": props.ariaLabel || props.label || props.defaultText || "Text field",
                onChange: (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ value: event.target.value }),
                onKeyDown: this.onKeyDown,
                value: this.state.value
            };

            return <span
                onBlur={(event: React.FocusEvent) => {
                    // Avoid triggering event if delete button
                    // was clicked
                    if (isNullOrUndefined(event.relatedTarget)) {
                        this.setState({ isEditing: false });
                    }
                }}>
                {label}
                {props.autoExpand !== false
                    ? <AutoExpandInput {...inputProps} />
                    : <input {...inputProps} />}
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

        const contextMenuItems: MenuItem[] = [
            { type: "header", label: "Text Field" },
            {
                id: "edit",
                label: "Edit",
                onSelect: () => this.setState({ isEditing: true })
            },
            ...(this.props.contextMenuOptions || []).map((option, index: number) => ({
                id: `custom-${index}`,
                label: option.text,
                onSelect: option.onClick
            }))
        ];

        return (
            <ContextMenu items={contextMenuItems}>
                <span
                    onClick={(event: MouseEvent) => {
                        if (!this.props.static) {
                            this.setState({ isEditing: true });
                        }
                    }}
                    className={props.displayClassName}
                >
                    <InlineMarkdown>{displayValue}</InlineMarkdown>
                </span>
            </ContextMenu>
        );
    }
}
