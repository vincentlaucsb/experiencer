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

interface PureMenuItemProps {
    children?: ReactNode;
    selected?: boolean;

    onClick?: (event: React.MouseEvent) => void;

    /** Additional class names for the menu item */
    className?: string;
    classNames?: Array<string>;
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

    return <li className={classes.join(' ')} onClick={props.onClick}>
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

interface PureDropdownProps extends PureMenuItemProps {
    trigger: any;
    hover?: boolean;
    ulProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
}

export function PureDropdown(props: PureDropdownProps) {
    /** See: https://purecss.io/js/menus.js */
    let [active, setActive] = React.useState(false);
    let classes = ['pure-menu-has-children'];

    if (props.hover) {
        classes.push('pure-menu-allow-hover');
        props['onMouseOver'] = () => setActive(true);
        props['onMouseOut'] = () => setActive(false);
    }

    let childClasses = ['pure-menu-children'];
    if (active) {
        classes.push('pure-menu-active');
    }

    const toggler = (event: React.MouseEvent) => {
        setActive(!active);
    }

    let newUlProps = {
        className: childClasses.join(' ')
    };

    if (props.ulProps) {
        newUlProps = {
            ...props.ulProps,
            className: `${props.ulProps.className} ${childClasses.join(' ')}`
        }
    }

    // TODO: Rework onBlur handler
    return (
        <PureMenuItem
            {...props}
            onClick={toggler}
            classNames={classes}>
            {props.trigger}
            <ul {...newUlProps}>
                {props.children}
            </ul>
        </PureMenuItem>
    );
}