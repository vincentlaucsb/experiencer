import React from "react";
import { PureMenuItem } from "./PureMenu";
import { Button } from "../Buttons";

export interface IconicMenuItemProps {
    onClick?: (() => void) | ((event: React.MouseEvent) => void);
    icon?: string;
    shortcut?: string;
    text?: string;
    disabled?: boolean;
}

/** A menu item with an icon and a text label */
export default function IconicMenuItem(props: IconicMenuItemProps) {
    let btnClsNames = ['toolbar-button'];
    let icon = <></>
    let text = <></>
    let onClick: any = props.onClick;
    let disabled = false;

    if (props.icon) {
        icon = <i className={`icofont-${props.icon}`} />
    }

    // If props.disabled is explictly set to false, then do not disable
    if ((!props.onClick || props.disabled) && props.disabled !== false) {
        disabled = true;
        onClick = undefined;
    }

    if (props.text) {
        btnClsNames.push('toolbar-button-has-text');
        text = <span className="toolbar-button-text">{props.text}</span>
    }

    const shortcut = props.shortcut ? <span className="toolbar-button-shortcut">{props.shortcut}</span>
        : <></>
    
    return (
        <PureMenuItem className="toolbar-item" onClick={props.onClick}>
            <Button className={btnClsNames.join(' ')} disabled={disabled}>
                {icon}
                {text}
                {shortcut}
            </Button>
        </PureMenuItem>
    );    
}