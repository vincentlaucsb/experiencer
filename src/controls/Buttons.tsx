import * as React from "react";

export type ButtonVariant = 'primary' | 'success' | 'warning' | 'error';
export type ButtonAppearance = 'solid' | 'outline';

interface ButtonProps extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
    /** @deprecated Prefer variant="primary" for new code. */
    primary?: boolean;
    variant?: ButtonVariant;
    appearance?: ButtonAppearance;
    disabled?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (props, ref) => {
        const { appearance = 'solid', primary, variant, ...buttonProps } = props;
        let classes = ['pure-button'];
        const semanticVariant = variant ?? (primary ? 'primary' : undefined);
        if (semanticVariant) {
            classes.push(`pure-button-${semanticVariant}`);
        }
        if (appearance === 'outline') {
            classes.push('pure-button-outline');
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
                <Button variant="success" onClick={props.onConfirm}>
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
