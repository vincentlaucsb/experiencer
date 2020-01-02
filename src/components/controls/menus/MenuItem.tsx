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

    if (props.icon) {
        icon = <i className={`icofont-${props.icon}`} />
    }

    if (!props.onClick || props.disabled) {
        btnClsNames.push('disabled');
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
            <Button className={btnClsNames.join(' ')}>
                {icon}
                {text}
                {shortcut}
            </Button>
        </PureMenuItem>
    );    
}