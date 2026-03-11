import React from "react";

import { PureMenuItem, PureMenuItemProps } from "./PureMenu";

type TriggerHandler = ((event: React.MouseEvent) => void) | (() => void);

interface DropdownTriggerProps {
    onClick?: TriggerHandler;
    'aria-haspopup'?: 'menu';
    'aria-controls'?: string;
    'aria-expanded'?: boolean;
}

export interface DropdownProps extends PureMenuItemProps {
    trigger: React.ReactElement<DropdownTriggerProps>;
    hover?: boolean;
    ulProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
}

export default function Dropdown(props: DropdownProps) {
    /** See: https://purecss.io/js/menus.js */
    let [active, setActive] = React.useState(false);
    const dropdownRef = React.useRef<HTMLLIElement | null>(null);
    const menuId = React.useId();
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
        event.stopPropagation();
        setActive(!active);
    }

    const onTriggerClick = (event: React.MouseEvent) => {
        toggler(event);

        const triggerOnClick = props.trigger?.props?.onClick;
        if (typeof triggerOnClick === 'function') {
            triggerOnClick(event);
        }
    };

    const onKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            setActive(false);
        }
    };

    const newUlProps: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> = {
        ...props.ulProps,
        className: [props.ulProps?.className, ...childClasses].filter(Boolean).join(' '),
        id: props.ulProps?.id || menuId,
        role: 'menu'
    };

    const trigger = React.cloneElement(props.trigger, {
        'aria-haspopup': 'menu',
        'aria-controls': newUlProps.id,
        'aria-expanded': active,
        onClick: props.hover ? props.trigger.props?.onClick : onTriggerClick
    });

    // TODO: Rework onBlur handler
    return (
        <PureMenuItem
            {...props}
            itemRef={dropdownRef}
            onKeyDown={onKeyDown}
            onMouseOut={onMouseOut}
            onMouseOver={onMouseOver}
            classNames={classes}>
            {trigger}
            <ul {...newUlProps}>
                {props.children}
            </ul>
        </PureMenuItem>
    );
}