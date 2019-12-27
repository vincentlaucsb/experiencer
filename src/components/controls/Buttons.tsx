import * as React from "react";

interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    primary?: boolean;
    disabled?: boolean;
}

export function Button(props: ButtonProps) {
    const newProps = {
        ...props
    };

    let classes = ['pure-button'];
    if (props.primary) {
        classes.push('pure-button-primary');
    }

    if (props.disabled) {
        classes.push('pure-button-disabled');
    }

    newProps['primary'] = undefined;
    newProps['disabled'] = undefined;

    return (
        <button className={classes.join(' ')} {...props} />
    );
}