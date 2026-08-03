import React from "react";
import { Button } from "../Buttons";
import type { BasicToolbarItemData, ToolbarItemData } from "@/types/toolbar";

// TODO: Remove these re-exports and import directly from types/toolbar
export type { BasicToolbarItemData, ToolbarItemData };

export interface ToolbarButtonProps {
    ariaLabel?: string;
    condensedButton?: boolean;
    disabled?: boolean;
    icon?: string;
    iconTone?: "brand";
    dropdownChild ?: boolean;
    dropdownTrigger?: boolean;
    onClick?: (event: React.MouseEvent) => void;
    text?: string;
    shortcut ?: string;
    "aria-haspopup"?: React.AriaAttributes["aria-haspopup"];
    "aria-expanded"?: React.AriaAttributes["aria-expanded"];
}

/**
 * A basic toolbar button
 * @param props
 */
const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    (props, ref) => {
        const hideText = props.condensedButton && !props.dropdownChild;
        const text = hideText ? <></> : <span className="button-text">{props.text}</span>
        const iconClassName = [
            `icofont-${props.icon}`,
            props.iconTone ? `toolbar-icon-${props.iconTone}` : undefined
        ].filter(Boolean).join(" ");
        const icon = props.icon ? <i className={iconClassName} aria-hidden="true" /> : <></>
        const shortcut = props.shortcut ? <span className="button-shortcut" aria-hidden="true">{props.shortcut}</span> : <></>
        const dropdownIndicator = props.dropdownTrigger
            ? <i className="icofont-caret-down toolbar-dropdown-indicator" aria-hidden="true" />
            : <></>;
        const ariaLabel = props.ariaLabel || (hideText ? props.text : undefined);
        const onClick = props.onClick;

        let Container: React.ComponentType<any> = Button;
        if (props.dropdownChild) {
            /** Thank you Google Chrome for allowing me to 
             *  craft this beautiful hack because you won't allow
             *  buttons to be grid containers
             */
            Container = (props) => {
                return (
                    <Button {...props}>
                        <div>
                            {props.children}
                        </div>
                    </Button>
                );
            };
        }

        return (
            <Container
                ref={ref}
                aria-label={ariaLabel}
                aria-haspopup={props["aria-haspopup"]}
                aria-expanded={props["aria-expanded"]}
                disabled={props.disabled}
                onClick={onClick}
            >
                {icon} {text} {dropdownIndicator} {shortcut}
            </Container>
        );
    }
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;
