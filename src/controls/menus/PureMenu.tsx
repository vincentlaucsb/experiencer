import React, { ReactNode } from "react";

interface PureMenuProps {
    children?: any;
    id?: string;
    horizontal?: boolean;
    divProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
    listProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
}

export default function PureMenu(props: PureMenuProps) {
    let classes = ['pure-menu'];
    if (props.horizontal) {
        classes.push('pure-menu-horizontal');
    }

    return (
        <div id={props.id} className={classes.join(' ')}
            {...props.divProps}>
            <ul className="pure-menu-list" {...props.listProps}>
                {props.children}
            </ul>
        </div>
    );
}

export interface PureMenuItemProps {
    children?: ReactNode;
    selected?: boolean;

    onClick?: (event: React.MouseEvent) => void;
    onMouseOver?: (event: React.MouseEvent) => void;
    onMouseOut?: (event: React.MouseEvent) => void;

    /** Additional class names for the menu item */
    className?: string;
    classNames?: Array<string>;
    itemRef?: React.Ref<HTMLLIElement>;
}

export function PureMenuItem(props: PureMenuItemProps) {
    let classes = ['pure-menu-item'];
    if (props.className) {
        classes.push(props.className);
    }

    if (props.selected) {
        classes.push('pure-menu-selected');
    }

    if (props.classNames) {
        props.classNames.forEach((value) => classes.push(value));
    }

    return <li
        className={classes.join(' ')}
        onClick={props.onClick}
        onMouseOut={props.onMouseOut}
        onMouseOver={props.onMouseOver}
        ref={props.itemRef}>
        {props.children}
    </li>
}

export function PureMenuLink(props: { children: any }) {
    return (
        <a href="#" className="pure-menu-link">
            {props.children}
        </a>
    );
}