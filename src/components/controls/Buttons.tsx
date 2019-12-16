import * as React from "react";

interface ButtonProps {
    children?: any;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    primary?: boolean;
}

export function Button<P extends ButtonProps>(props: P) {
    let classes = ['pure-button'];
    if (props.primary) {
        classes.push('pure-button-primary');
    }

    return (
        <button className={classes.join(' ')} onClick={props.onClick}>
            {props.children}
        </button>
    );
}