import React from "react";

import { PureMenuItem, PureMenuItemProps } from "./PureMenu";

export interface DropdownProps extends PureMenuItemProps {
    trigger: any;
    hover?: boolean;
    ulProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
}

export default function Dropdown(props: DropdownProps) {
    /** See: https://purecss.io/js/menus.js */
    let [active, setActive] = React.useState(false);
    const dropdownRef = React.useRef<HTMLLIElement | null>(null);
    let classes = ['pure-menu-has-children'];

    const onMouseOver = props.hover ? () => setActive(true) : props.onMouseOver;
    const onMouseOut = props.hover ? () => setActive(false) : props.onMouseOut;

    if (props.hover) {
        classes.push('pure-menu-allow-hover');
    }

    let childClasses = ['pure-menu-children'];
    if (active) {
        classes.push('pure-menu-active');
    }

    React.useEffect(() => {
        if (!active) {
            return;
        }

        const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
            const target = event.target as Node | null;
            if (!target || !dropdownRef.current) {
                return;
            }

            if (!dropdownRef.current.contains(target)) {
                setActive(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
        };
    }, [active]);

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
            itemRef={dropdownRef}
            onClick={toggler}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            classNames={classes}>
            {props.trigger}
            <ul {...newUlProps}>
                {props.children}
            </ul>
        </PureMenuItem>
    );
}