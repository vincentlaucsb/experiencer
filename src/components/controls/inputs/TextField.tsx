import React from "react";

interface ResumeTextFieldProps {
    isEditing?: boolean;

    value?: string;
    label?: string;
    defaultText?: string;
    displayClassName?: string;

    /** A callback which modifies the display text */
    displayProcessor?: (text?: string) => string;

    onChange: (text: string) => void;

    /** Callback when display text is clicked */
    onClick?: () => void;

    /** Callback when enter key is pressed */
    onEnterDown?: () => void;
}

export default function ResumeTextField(props: ResumeTextFieldProps) {
    const initialValue = props.value || "";
    let [value, setValue] = React.useState(initialValue);
    let [escapePressed, setEscape] = React.useState(false);

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' && props.onEnterDown) {
            props.onEnterDown();
        }
        else if (event.key === 'Escape') {
            setEscape(true);
            setValue(initialValue);

            // TODO: Add a different toggleEdit method
            if (props.onClick) {
                props.onClick();
            }
        }

        // event.stopPropagation();
    };

    const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(event.target.value);
    }

    React.useEffect(() => {
        if (props.isEditing) {
            setEscape(false);
        }
        else if (value !== initialValue && !escapePressed) {
            props.onChange(value);
        }
    }, [props.isEditing]);

    let label = <></>
    if (props.label) {
        label = <label>{props.label || "Value"}</label>
    }

    if (props.isEditing) {
        return <>
            {label}
            <input
                onChange={onChange}
                onKeyDown={onKeyDown}
                value={value}
            />
        </>
    }

    let displayValue = props.value;
    if (props.value && props.value.length > 0) {
        displayValue = props.displayProcessor ? props.displayProcessor(props.value) : props.value;
    }
    else {
        displayValue = "Enter a value";
    }
    
    return <span className={props.displayClassName} onClick={props.onClick}
    >{displayValue}</span>
}