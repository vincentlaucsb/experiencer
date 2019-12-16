import React from "react";

interface PureMenuProps {
    children?: any;
    horizontal?: boolean;
}

export default function PureMenu(props: PureMenuProps) {
    let classes = ['pure-menu'];
    if (props.horizontal) {
        classes.push('pure-menu-horizontal');
    }

    return (
        <div className={classes.join(' ')}>
            <ul className="pure-menu-list">
                {props.children}
            </ul>
        </div>
    );
}

interface PureMenuItemProps {
    children?: any;
    selected?: boolean;
}

export function PureMenuItem<P extends PureMenuItemProps>(props: P) {
    let classes = ['pure-menu-item'];
    if (props.selected) {
        classes.push('pure-menu-selected');
    }

    return <li className={classes.join(' ')} {...props}>
        {props.children}
    </li>
}

export function PureMenuLink(props: { children: string }) {
    return (
        <a href="#" className="pure-menu-link">
            {props.children}
        </a>
    );
}