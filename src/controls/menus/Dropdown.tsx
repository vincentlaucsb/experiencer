import React from "react";
import { DropdownMenu } from "@popright/react";
import type { MenuItem } from "popright";

export interface DropdownProps {
    trigger: React.ReactElement<DropdownTriggerProps>;
    items: MenuItem[];
    className?: string;
    wrapperClassName?: string;
}

interface DropdownTriggerProps {
    onClick?: (event: React.MouseEvent) => void;
    "aria-haspopup"?: "menu";
    "aria-controls"?: string;
    "aria-expanded"?: boolean;
}

export default function Dropdown({ trigger, items, className, wrapperClassName }: DropdownProps) {
    const [isOpen, setIsOpen] = React.useState(false);
    const menuId = `dropdown-menu-${React.useId().replace(/:/g, "")}`;
    const accessibleTrigger = React.cloneElement(trigger, {
        "aria-haspopup": "menu",
        "aria-controls": menuId,
        "aria-expanded": isOpen,
        onClick: (event: React.MouseEvent) => {
            trigger.props.onClick?.(event);
            setIsOpen((current) => !current);
        }
    });

    return (
        <li className={["pure-menu-item", wrapperClassName].filter(Boolean).join(" ")}>
            <DropdownMenu
                className={className}
                id={menuId}
                items={items}
                minWidth={180}
                onOpen={() => setIsOpen(true)}
                onClose={() => setIsOpen(false)}
            >
                {accessibleTrigger}
            </DropdownMenu>
        </li>
    );
}
