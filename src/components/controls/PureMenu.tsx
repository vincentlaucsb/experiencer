import React from "react";

interface PureMenuProps {
    children?: any;
    id?: string;
    horizontal?: boolean;
}

export default function PureMenu(props: PureMenuProps) {
    let classes = ['pure-menu'];
    if (props.horizontal) {
        classes.push('pure-menu-horizontal');
    }

    return (
        <div id={props.id} className={classes.join(' ')}>
            <ul className="pure-menu-list">
                {props.children}
            </ul>
        </div>
    );
}

interface PureMenuItemProps {
    children?: any;
    selected?: boolean;

    /** Additional class names for the menu item */
    classNames?: Array<string>;
}

export function PureMenuItem<P extends PureMenuItemProps>(props: P) {
    let classes = ['pure-menu-item'];
    if (props.selected) {
        classes.push('pure-menu-selected');
    }

    if (props.classNames) {
        props.classNames.forEach((value) => classes.push(value));
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

interface PureDropdownProps extends PureMenuItemProps {
    content: any;
    hover?: boolean;
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

    const toggler = (event: React.MouseEvent<HTMLLIElement>) => {
        setActive(!active);
    }

    return (
        <PureMenuItem
            {...props}
            onClick={toggler}
            onBlur={() => setActive(false)}
            classNames={classes}>
            {props.content}
            <ul className={childClasses.join(' ')}>
                {props.children}
            </ul>
        </PureMenuItem>
    );
}