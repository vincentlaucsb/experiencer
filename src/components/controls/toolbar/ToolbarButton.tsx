import React from "react";
import { Button } from "../Buttons";

export interface BasicToolbarItemData {
    icon?: string;
    items?: BasicToolbarItemData[];
    text?: string;
}

export interface ToolbarItemData extends BasicToolbarItemData {
    action?: (() => void) | ((event: React.MouseEvent) => void);

    /** Whether or not text should be hidden when displayed on toolbar */
    condensedButton?: boolean;

    content?: React.ReactElement;
    items?: ToolbarItemData[];
    shortcut?: string;
};

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
export default function ToolbarButton(props: ToolbarButtonProps) {
    const text = props.condensedButton && !props.dropdownChild ?
        <></> : <span className="button-text">{props.text}</span>
    const icon = props.icon ? <i className={`icofont-${props.icon}`} /> : <></>
    const shortcut = props.shortcut ? <span className="button-shortcut">{props.shortcut}</span> : <></>

    let Container = Button;
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
        <Container disabled={props.disabled} onClick={props.action}>
            {icon} {text} {shortcut}
        </Container>
    );
}