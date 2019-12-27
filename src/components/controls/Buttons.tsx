import * as React from "react";

interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    primary?: boolean;
    disabled?: boolean;
}

export function Button(props: ButtonProps) {
    let classes = ['pure-button'];
    if (props.primary) {
        classes.push('pure-button-primary');
    }

    if (props.disabled) {
        classes.push('pure-button-disabled');
    }

    if (props.className) {
        classes.push(props.className);
    }

    const newProps = {
        ...props,
        className: classes.join(' '),
    };

    return (
        <button className={classes.join(' ')} {...newProps} />
    );
}