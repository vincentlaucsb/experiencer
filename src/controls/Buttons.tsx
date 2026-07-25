import * as React from "react";

interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    primary?: boolean;
    disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        const { primary, ...buttonProps } = props;
        let classes = ['pure-button'];
        if (primary) {
            classes.push('pure-button-primary');
        }

        if (buttonProps.disabled) {
            classes.push('pure-button-disabled');
        }

        if (buttonProps.className) {
            classes.push(buttonProps.className);
        }

        const newProps = {
            ...buttonProps,
            className: classes.join(' '),
        };

        return (
            <button ref={ref} {...newProps} />
        );
    }
);

Button.displayName = 'Button';

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
