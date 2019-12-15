import React from "react";
import { TextField } from "@material-ui/core";

interface ResumeTextFieldProps {
    value?: string;
    label?: string;
    defaultText?: string;

    onChange: (text: string) => void;
}

export default function ResumeTextField(props: ResumeTextFieldProps) {
    const initialValue = props.value || "";

    let [isEditing, toggleEditing] = React.useState(false);
    let [textValue, setTextValue] = React.useState(initialValue);

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key == 'Enter') {
            toggleEditing(false);
            props.onChange(textValue);
        }
        else if (event.key == 'Escape') {
            // Cancel changes
            toggleEditing(false);
            setTextValue(initialValue);
        }
    };

    if (isEditing) {
        return <TextField
            onChange={ (event) => setTextValue(event.target.value) }
            onKeyDown={onKeyDown}
            label={props.label || "Value"}
            value={textValue}
        />
    }
    
    return <span
        onClick={() => toggleEditing(true)}
    >{props.value || props.defaultText || "Enter a value"}</span>
}