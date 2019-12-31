import React from "react";
import { PureMenuItem } from "./PureMenu";

export interface IconicMenuItemProps {
    onClick?: (event?: React.MouseEvent) => void;
    icon?: string;
    shortcut?: string;
    label: string;
    disabled?: boolean;
}

/** A menu item with an icon and a text label */
export default function IconicMenuItem(props: IconicMenuItemProps) {
    const Item = PureMenuItem;
    let itemClasses = [''];
    let icon = <></>
    let onClick: any = props.onClick;

    if (props.icon) {
        icon = <i className={`icofont-${props.icon}`} />
    }
    else {
        itemClasses.push('no-icon');
    }

    if (props.disabled || !props.onClick) {
        itemClasses.push('disabled');
        onClick = undefined;
    }

    const shortcut = props.shortcut ? <span className="shortcut">{props.shortcut}</span>
        : <></>
    
    return (
        <Item className={itemClasses.join(' ')} onClick={onClick}>
            {icon}
            <span className="menu-item-label">{props.label}</span>
            {shortcut}
        </Item>
    );    
}