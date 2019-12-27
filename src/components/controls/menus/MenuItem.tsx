import React from "react";
import { PureMenuItem } from "./PureMenu";

export interface IconicMenuItemProps {
    onClick: (event?: React.MouseEvent) => void;
    icon?: string;
    shortcut?: string;
    label: string;
}

/** A menu item with an icon and a text label */
export default function IconicMenuItem(props: IconicMenuItemProps) {
    const Item = PureMenuItem;

    let icon = <></>
    if (props.icon) {
        icon = <i className={`icofont-${ props.icon }`} />
    }

    const shortcut = props.shortcut ? <span className="shortcut">{props.shortcut}</span>
        : <></>

    const itemClass = props.icon ? "" : "no-icon";

    return (
        <Item className={itemClass} onClick={props.onClick}>
            {icon}
            <span className="menu-item-label">{props.label}</span>
            {shortcut}
        </Item>
    );    
}