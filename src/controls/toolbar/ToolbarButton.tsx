import React from "react";
import { Button } from "../Buttons";
import type { BasicToolbarItemData, ToolbarItemData } from "@/types/toolbar";

// TODO: Remove these re-exports and import directly from types/toolbar
export type { BasicToolbarItemData, ToolbarItemData };

export interface ToolbarButtonProps {
    action?: (() => void) | ((event: React.MouseEvent) => void);
    condensedButton?: boolean;
    disabled?: boolean;
    icon?: string;
    dropdownChild ?: boolean;
    text?: string;
    shortcut ?: string;
}

/**
 * A basic toolbar button
 * @param props
 */
const ToolbarButton = React.forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    (props, ref) => {
        const text = props.condensedButton && !props.dropdownChild ?
            <></> : <span className="button-text">{props.text}</span>
        const icon = props.icon ? <i className={`icofont-${props.icon}`} /> : <></>
        const shortcut = props.shortcut ? <span className="button-shortcut">{props.shortcut}</span> : <></>

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
            <Container ref={ref} disabled={props.disabled} onClick={props.action}>
                {icon} {text} {shortcut}
            </Container>
        );
    }
);

ToolbarButton.displayName = 'ToolbarButton';

export default ToolbarButton;