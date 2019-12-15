import React from "react";
import { TextField } from "@material-ui/core";

interface ResumeTextFieldProps {
    isEditing?: boolean;

    value?: string;
    label?: string;
    defaultText?: string;

    /** A callback which modifies the display text */
    displayProcessor?: (text?: string) => string;

    onChange: (text: string) => void;

    /** Callback when display text is clicked */
    onClick?: () => void;

    /** Callback when enter key is pressed */
    onEnterDown?: () => void;
}

export default function ResumeTextField(props: ResumeTextFieldProps) {
    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && props.onEnterDown) {
            props.onEnterDown();
        }
    };

    if (props.isEditing) {
        return <TextField
            onChange={(event) => props.onChange(event.target.value)}
            onKeyDown={onKeyDown}
            label={props.label || "Value"}
            value={props.value || ""}
        />
    }

    const displayValue = props.displayProcessor ? props.displayProcessor(props.value) : props.value;
    
    return <span onClick={props.onClick}
    >{displayValue || props.defaultText || "Enter a value"}</span>
}