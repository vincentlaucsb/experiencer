import * as React from "react";

interface ButtonProps {
    children?: Array<string | JSX.Element> | string | JSX.Element;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    primary?: boolean;
    disabled?: boolean;
}

export function Button<P extends ButtonProps>(props: P) {
    let classes = ['pure-button'];
    if (props.primary) {
        classes.push('pure-button-primary');
    }

    if (props.disabled) {
        classes.push('pure-button-disabled');
    }

    return (
        <button className={classes.join(' ')} onClick={props.onClick}>
            {props.children}
        </button>
    );
}