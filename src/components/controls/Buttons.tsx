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

interface ConfirmProps {
    buttonProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
    children: React.ReactElement;
    onConfirm: () => void;
}

export function Confirm(props: ConfirmProps) {
    let [prompt, setPrompt] = React.useState(false);

    if (prompt) {
        return (
            <>
                <Button onClick={props.onConfirm}>
                    <i className="icofont-ui-check" />
                </Button>
                <Button onClick={() => setPrompt(false)}>
                    <i className="icofont-ui-close" />
                </Button>
            </>
        );
    }

    let newButtonProps = {
        ...props.buttonProps,
        onClick: () => setPrompt(true)
    };

    return <Button {...newButtonProps}>
        {props.children}
    </Button>
}